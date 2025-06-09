
'use client';

import { useActionState, useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; 
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { submitPersonalizedRequest, type FormState } from '@/lib/actions';
import type { WatchType } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircleIcon, SendIcon, Loader2, SearchIcon } from "lucide-react"; 
import { useFormStatus } from 'react-dom';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth'; 
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast'; 

const PersonalizedRequestSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  watchType: z.string().min(1, { message: "Seleziona un tipo di orologio." }),
  desiredBrand: z.string().optional(),
  desiredModel: z.string().optional(),
  budgetMin: z.coerce.number().min(0).optional().nullable(),
  budgetMax: z.coerce.number().min(0).optional().nullable(),
  aiCriteria: z.string().max(500, {message: "La descrizione per AI non può superare i 500 caratteri."}).optional(), 
  additionalNotes: z.string().max(1000, {message: "Le note aggiuntive non possono superare i 1000 caratteri."}).optional(),
  watchRef: z.string().optional(), // Campo nascosto per la referenza
}).refine(data => {
  if (data.budgetMin !== null && data.budgetMin !== undefined &&
      data.budgetMax !== null && data.budgetMax !== undefined) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: "Il budget massimo deve essere maggiore o uguale al budget minimo.",
  path: ["budgetMax"],
});

type PersonalizedRequestFormData = z.infer<typeof PersonalizedRequestSchema>;

const watchTypes: WatchType[] = ['Dress', 'Sportivo', 'Cronografo', 'Subacqueo', 'Vintage', 'Altro'];
const budgetPresets = [
  { label: "€0 - €5,000", min: 0, max: 5000 },
  { label: "€5,000 - €15,000", min: 5000, max: 15000 },
  { label: "€15,000 - €50,000", min: 15000, max: 50000 },
  { label: "€50,000+", min: 50000, max: 200000 }, 
];

const LOCAL_STORAGE_KEY_DATA = 'pendingRequestData';
const LOCAL_STORAGE_KEY_REDIRECT = 'pendingRequestRedirectPath';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
          Invio in corso...
        </>
      ) : (
        <>
          Invia Richiesta <SendIcon className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

interface SearchParamsHandlerProps {
  setValue: (name: any, value: any, options?: any) => void;
  watch: (name: any) => any;
  router: ReturnType<typeof useRouter>;
  pathname: string;
}

function SearchParamsHandler({ setValue, watch, router, pathname }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const watchNameQuery = searchParams.get('watchName');
    const watchBrandQuery = searchParams.get('watchBrand');
    const watchRefQuery = searchParams.get('watchRef');

    if (watchNameQuery || watchBrandQuery || watchRefQuery) {
      let initialCriteria = "Sono interessato a discutere o avviare una trattativa per l'orologio";
      if (watchBrandQuery) initialCriteria += ` ${watchBrandQuery}`;
      if (watchNameQuery) initialCriteria += ` ${watchNameQuery}`;
      if (watchRefQuery && watchRefQuery !== 'undefined' && watchRefQuery !== 'null') initialCriteria += ` (Ref: ${watchRefQuery})`;
      initialCriteria += ". Potete fornirmi maggiori dettagli o avviare una consulenza?";
      
      if (!watch('aiCriteria')) setValue('aiCriteria', initialCriteria);
      if (watchBrandQuery && !watch('desiredBrand')) setValue('desiredBrand', watchBrandQuery);
      if (watchNameQuery && !watch('desiredModel')) setValue('desiredModel', watchNameQuery);
      if (watchRefQuery && !watch('watchRef')) setValue('watchRef', watchRefQuery);
    }
  }, [searchParams, setValue, watch]);

  return null; // This component doesn't render anything
}

export default function RequestForm() {
  const initialState: FormState = { message: '', success: false, issues: [] };
  const [actionState, formAction] = useActionState(submitPersonalizedRequest, initialState);
  const searchParams = useSearchParams();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { register, control, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<PersonalizedRequestFormData>({
    resolver: zodResolver(PersonalizedRequestSchema),
    defaultValues: {
      budgetMin: budgetPresets[0].min,
      budgetMax: budgetPresets[0].max,
      name: '',
      email: '',
      watchType: '',
      desiredBrand: '',
      desiredModel: '',
      aiCriteria: '',
      additionalNotes: '',
      watchRef: '',
    }
  });

  const [budgetRange, setBudgetRange] = useState<[number, number]>([budgetPresets[0].min, budgetPresets[0].max]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (actionState.success) {
      reset(); 
      setBudgetRange([budgetPresets[0].min, budgetPresets[0].max]); 
      toast({
        title: "Richiesta Inviata!",
        description: actionState.message,
        variant: "default",
      });
      if (searchParams.get('watchName') || searchParams.get('watchBrand') || searchParams.get('watchRef')) {
        router.replace(pathname, { scroll: false });
      }
    } else if (actionState.message && !actionState.success && (actionState.issues || actionState.fields)) {
        toast({
            title: "Errore Invio Richiesta",
            description: actionState.message || "Controlla i campi del form.",
            variant: "destructive",
        });
        if (actionState.fields) {
            Object.entries(actionState.fields).forEach(([key, value]) => {
                setValue(key as keyof PersonalizedRequestFormData, value as any, { shouldValidate: true });
            });
        }
    }
  }, [actionState, reset, setValue, toast, router, pathname]);


  useEffect(() => {
    if (authLoading) return; 

    const pendingDataString = localStorage.getItem(LOCAL_STORAGE_KEY_DATA);
    const pendingRedirectPath = localStorage.getItem(LOCAL_STORAGE_KEY_REDIRECT);
    
    const wasRedirectedFromAuth = searchParams.get('fromForm') === 'true' && searchParams.get('origin') === 'requestForm';

    if (currentUser) { 
      if (pendingDataString && pendingRedirectPath === pathname && wasRedirectedFromAuth) {
        try {
          const pendingData = JSON.parse(pendingDataString) as PersonalizedRequestFormData;
          Object.keys(pendingData).forEach(key => {
            setValue(key as keyof PersonalizedRequestFormData, pendingData[key as keyof PersonalizedRequestFormData], { shouldValidate: true });
          });
          if (currentUser.displayName) setValue('name', currentUser.displayName, { shouldValidate: true });
          if (currentUser.email) setValue('email', currentUser.email, { shouldValidate: true });

          if (pendingData.budgetMin !== undefined && pendingData.budgetMax !== undefined) {
            setBudgetRange([pendingData.budgetMin ?? 0, pendingData.budgetMax ?? 0]);
          }

          localStorage.removeItem(LOCAL_STORAGE_KEY_DATA);
          localStorage.removeItem(LOCAL_STORAGE_KEY_REDIRECT);
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.delete('fromForm');
          newSearchParams.delete('origin');
          router.replace(`${pathname}?${newSearchParams.toString()}`, { scroll: false });

          toast({ title: "Dati Ripristinati", description: "I dati della tua richiesta precedente sono stati ripristinati. Puoi inviarla ora." });
        } catch (e) {
          console.error("Errore nel parsare pendingRequestData:", e);
          localStorage.removeItem(LOCAL_STORAGE_KEY_DATA);
          localStorage.removeItem(LOCAL_STORAGE_KEY_REDIRECT);
        } 
      } else {
        if (currentUser.displayName && !watch('name')) setValue('name', currentUser.displayName);
        if (currentUser.email && !watch('email')) setValue('email', currentUser.email);
      }
    }
  }, [currentUser, authLoading, setValue, pathname, router, toast, searchParams, watch]);


  const handleActualSubmit = async (data: PersonalizedRequestFormData) => {
    if (!currentUser && !authLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY_DATA, JSON.stringify(data));
      localStorage.setItem(LOCAL_STORAGE_KEY_REDIRECT, pathname);
      toast({
        title: "Login Richiesto",
        description: "Per inviare la richiesta devi effettuare il login o registrarti. I tuoi dati sono stati salvati temporaneamente.",
        duration: 7000,
      });
      const currentQuery = new URLSearchParams(searchParams.toString()).toString();
      router.push(`/login?redirect=${pathname}${currentQuery ? `&${currentQuery}` : ''}&fromForm=true&origin=requestForm`);
      return;
    }

    const formDataForAction = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
         if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
          formDataForAction.append(key, String(value));
        }
      }
    });
    formAction(formDataForAction);
  };

  const handleBudgetChange = (value: [number, number]) => {
    setBudgetRange(value);
    setValue("budgetMin", value[0], { shouldValidate: true });
    setValue("budgetMax", value[1], { shouldValidate: true });
  };

  const handlePresetChange = (value: string) => {
    const preset = budgetPresets.find(p => `${p.min}-${p.max}` === value);
    if (preset) {
      handleBudgetChange([preset.min, preset.max]);
    }
  };

  if (authLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="h-12 w-12 text-accent animate-spin" />
            <p className="mt-4 text-muted-foreground">Caricamento informazioni utente...</p>
        </div>
    );
  }
  
  function InnerSuspenseFallback() {
      // You can add a minimal loading indicator if needed, but it might not be visible
      return null; 
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl bg-card border border-border/60">
      <CardHeader className="text-center">
        <SearchIcon className="mx-auto h-12 w-12 text-accent mb-4" />
        <CardTitle className="font-headline text-4xl text-primary">Richiesta Personalizzata</CardTitle>
        <CardDescription className="text-muted-foreground text-lg">
          Descrivici l'orologio dei tuoi sogni o quello che ti interessa. Lo troveremo per te.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleActualSubmit)}
          className="space-y-8"
        >
          <Suspense fallback={<InnerSuspenseFallback />}>
            <SearchParamsHandler setValue={setValue} watch={watch} router={router} pathname={pathname} />
          </Suspense>
          {actionState.message && !actionState.success && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>{actionState.message}</AlertDescription>
              {actionState.issues && actionState.issues.length > 0 && (
                <ul className="list-disc list-inside mt-2 text-sm">
                  {actionState.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
              )}
            </Alert>
          )}
          {actionState.message && actionState.success && (
             <Alert variant="default" className="bg-green-500/10 border-green-500 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-600 dark:text-green-500">Successo!</AlertTitle>
              <AlertDescription>{actionState.message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-foreground/80">Nome Completo</Label>
              <Input id="name" {...register("name")} placeholder="Mario Rossi" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" 
                     readOnly={!!(currentUser && currentUser.displayName)} 
                     aria-disabled={!!(currentUser && currentUser.displayName)}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="text-foreground/80">Indirizzo Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="mario.rossi@esempio.com" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" 
                     readOnly={!!(currentUser && currentUser.email)}
                     aria-disabled={!!(currentUser && currentUser.email)}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="watchType" className="text-foreground/80">Tipo di Orologio</Label>
            <Controller
              name="watchType"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} >
                  <SelectTrigger id="watchType" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent">
                    <SelectValue placeholder="Seleziona un tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {watchTypes.map(type => (
                      <SelectItem key={type} value={type} className="hover:bg-accent/20 focus:bg-accent/20">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.watchType && <p className="text-sm text-destructive mt-1">{errors.watchType.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="desiredBrand" className="text-foreground/80">Marca Desiderata (Opzionale)</Label>
              <Input id="desiredBrand" {...register("desiredBrand")} placeholder="Es. Rolex, Omega" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
            </div>
            <div>
              <Label htmlFor="desiredModel" className="text-foreground/80">Modello Desiderato (Opzionale)</Label>
              <Input id="desiredModel" {...register("desiredModel")} placeholder="Es. Submariner, Speedmaster" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
            </div>
          </div>
          
          {/* Campo nascosto per la referenza */}
          <input type="hidden" {...register("watchRef")} />


          <div>
            <Label className="text-foreground/80">Fascia di Prezzo (Opzionale)</Label>
            <div className="mt-2 space-y-3">
              <Controller
                name="budgetMin" 
                control={control}
                render={({ field }) => ( 
                  <Select
                    onValueChange={handlePresetChange}
                    value={budgetPresets.find(p => p.min === budgetRange[0] && p.max === budgetRange[1]) 
                           ? `${budgetRange[0]}-${budgetRange[1]}` 
                           : "custom"}
                  >
                    <SelectTrigger className="w-full md:w-1/2 bg-input border-border focus:border-accent focus:ring-accent">
                      <SelectValue placeholder="Seleziona fascia di prezzo predefinita" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {budgetPresets.map(preset => (
                        <SelectItem key={preset.label} value={`${preset.min}-${preset.max}`} className="hover:bg-accent/20 focus:bg-accent/20">{preset.label}</SelectItem>
                      ))}
                       <SelectItem value="custom">Personalizzata (usa slider)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <Slider
                value={budgetRange}
                onValueChange={handleBudgetChange}
                min={0}
                max={200000}
                step={500}
                className="[&>span>span]:bg-accent [&>span]:bg-primary/30"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>€{budgetRange[0].toLocaleString('it-IT')}</span>
                <span>€{budgetRange[1].toLocaleString('it-IT')}</span>
              </div>
              <input type="hidden" {...register("budgetMin")} value={budgetRange[0]} />
              <input type="hidden" {...register("budgetMax")} value={budgetRange[1]} />
              {errors.budgetMax && <p className="text-sm text-destructive mt-1">{errors.budgetMax.message}</p>}
              {errors.budgetMin && !errors.budgetMax && <p className="text-sm text-destructive mt-1">{errors.budgetMin.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="aiCriteria" className="text-foreground/80">Descrivi la tua richiesta</Label> 
            <Textarea
              id="aiCriteria" 
              {...register("aiCriteria")}
              placeholder="Es. Cerco un orologio sportivo elegante, resistente all'acqua, con bracciale in acciaio, quadrante blu, sotto i 10.000€"
              className="mt-1 min-h-[100px] bg-input border-border focus:border-accent focus:ring-accent"
            />
             {errors.aiCriteria && <p className="text-sm text-destructive mt-1">{errors.aiCriteria.message}</p>}
          </div>

          <div>
            <Label htmlFor="additionalNotes" className="text-foreground/80">Note Aggiuntive (Opzionale)</Label>
            <Textarea
              id="additionalNotes"
              {...register("additionalNotes")}
              placeholder="Qualsiasi altra preferenza o dettaglio utile..."
              className="mt-1 min-h-[120px] bg-input border-border focus:border-accent focus:ring-accent"
            />
            {errors.additionalNotes && <p className="text-sm text-destructive mt-1">{errors.additionalNotes.message}</p>}
          </div>

          <p className="text-xs text-muted-foreground">
            Cliccando "Invia Richiesta", accetti i nostri Termini di Servizio e la Politica sulla Privacy. Un nostro concierge ti contatterà entro 24 ore. Il servizio di ricerca ha un costo che ti verrà comunicato.
          </p>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

    