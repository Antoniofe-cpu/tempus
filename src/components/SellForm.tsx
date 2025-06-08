
// src/components/SellForm.tsx
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { submitSellRequest, type FormState } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircleIcon, SendIcon, Loader2, DollarSign, Box, FileText, CalendarDays } from "lucide-react";
import { useFormStatus } from 'react-dom';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { watchConditionOptions, type WatchCondition } from '@/lib/types';

const currentYear = new Date().getFullYear();
const SellRequestSchemaClient = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  phone: z.string().optional().refine(val => !val || /^[+]?[0-9\s-()]*$/.test(val), { message: "Numero di telefono non valido."}),
  watchBrand: z.string().min(1, { message: "La marca è obbligatoria." }),
  watchModel: z.string().min(1, { message: "Il modello è obbligatorio." }),
  watchYear: z.coerce.number().int().min(1900, "Anno non valido.").max(currentYear, `L'anno non può superare ${currentYear}.`).optional().nullable(),
  watchCondition: z.enum(watchConditionOptions, { errorMap: () => ({ message: 'Seleziona una condizione valida.' })}),
  hasBox: z.boolean().default(false),
  hasPapers: z.boolean().default(false),
  desiredPrice: z.coerce.number().min(0, "Il prezzo deve essere positivo.").optional().nullable(),
  additionalInfo: z.string().max(1000, "Le informazioni aggiuntive non possono superare 1000 caratteri.").optional(),
});

type SellRequestFormData = z.infer<typeof SellRequestSchemaClient>;

const LOCAL_STORAGE_KEY_SELL_DATA = 'pendingSellRequestData';
const LOCAL_STORAGE_KEY_SELL_REDIRECT = 'pendingSellRedirectPath';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
          Invio Proposta...
        </>
      ) : (
        <>
          Invia Proposta di Vendita <SendIcon className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export default function SellForm() {
  const initialState: FormState = { message: '', success: false, issues: [] };
  const [actionState, formAction] = useActionState(submitSellRequest, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { register, handleSubmit, control, formState: { errors }, watch, setValue, reset } = useForm<SellRequestFormData>({
    resolver: zodResolver(SellRequestSchemaClient),
    defaultValues: {
      name: '', email: '', phone: '', watchBrand: '', watchModel: '',
      watchYear: undefined, watchCondition: undefined, hasBox: false, hasPapers: false,
      desiredPrice: undefined, additionalInfo: '',
    }
  });

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
      toast({
        title: "Proposta Inviata!",
        description: actionState.message,
        variant: "default",
      });
    } else if (actionState.message && !actionState.success && (actionState.issues || actionState.fields)) {
        toast({
            title: "Errore Invio Proposta",
            description: actionState.message || "Controlla i campi del form.",
            variant: "destructive",
        });
    }
  }, [actionState, reset, toast]);

  useEffect(() => {
    if (authLoading) return; 

    const pendingDataString = localStorage.getItem(LOCAL_STORAGE_KEY_SELL_DATA);
    const pendingRedirectPath = localStorage.getItem(LOCAL_STORAGE_KEY_SELL_REDIRECT);
    const wasRedirectedFromAuth = searchParams.get('fromForm') === 'true' && searchParams.get('origin') === 'sellForm';

    if (currentUser) { 
      if (pendingDataString && pendingRedirectPath === pathname && wasRedirectedFromAuth) {
        try {
          const pendingData = JSON.parse(pendingDataString) as SellRequestFormData;
          Object.keys(pendingData).forEach(key => {
            setValue(key as keyof SellRequestFormData, pendingData[key as keyof SellRequestFormData], { shouldValidate: true });
          });
          if (currentUser.displayName) setValue('name', currentUser.displayName, { shouldValidate: true });
          if (currentUser.email) setValue('email', currentUser.email, { shouldValidate: true });

          localStorage.removeItem(LOCAL_STORAGE_KEY_SELL_DATA);
          localStorage.removeItem(LOCAL_STORAGE_KEY_SELL_REDIRECT);
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.delete('fromForm');
          newSearchParams.delete('origin');
          router.replace(`${pathname}?${newSearchParams.toString()}`, { scroll: false });

          toast({ title: "Dati Proposta Ripristinati", description: "I dati della tua proposta sono stati ripristinati." });
        } catch (e) {
          console.error("Errore nel parsare pendingSellRequestData:", e);
          localStorage.removeItem(LOCAL_STORAGE_KEY_SELL_DATA);
          localStorage.removeItem(LOCAL_STORAGE_KEY_SELL_REDIRECT);
        }
      } else {
        if (currentUser.displayName && !watch('name')) setValue('name', currentUser.displayName);
        if (currentUser.email && !watch('email')) setValue('email', currentUser.email);
      }
    }
  }, [currentUser, authLoading, setValue, pathname, router, toast, searchParams, watch]);

  const handleActualSubmit = async (data: SellRequestFormData) => {
    if (!currentUser && !authLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY_SELL_DATA, JSON.stringify(data));
      localStorage.setItem(LOCAL_STORAGE_KEY_SELL_REDIRECT, pathname);
      toast({
        title: "Login Richiesto",
        description: "Per inviare la proposta devi effettuare il login o registrarti. I tuoi dati sono stati salvati.",
        duration: 7000,
      });
      router.push(`/login?redirect=${pathname}&fromForm=true&origin=sellForm`);
      return;
    }

    const formDataForAction = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
         if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          formDataForAction.append(key, String(value));
        }
      }
    });
    formAction(formDataForAction);
  };

  if (authLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="h-12 w-12 text-accent animate-spin" />
            <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl bg-card border border-border/60">
      <CardHeader className="text-center">
        <DollarSign className="mx-auto h-12 w-12 text-accent mb-4" />
        <CardTitle className="font-headline text-4xl text-primary">Vendi il Tuo Orologio</CardTitle>
        <CardDescription className="text-muted-foreground text-lg">
          Compila il modulo per proporre il tuo orologio. Riceverai una nostra valutazione.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleActualSubmit)}
          className="space-y-8"
        >
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
              <Input id="name" {...register("name")} className="mt-1 bg-input" readOnly={!!(currentUser && currentUser.displayName)} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="text-foreground/80">Email</Label>
              <Input id="email" type="email" {...register("email")} className="mt-1 bg-input" readOnly={!!(currentUser && currentUser.email)} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-foreground/80">Telefono (Opzionale)</Label>
            <Input id="phone" type="tel" {...register("phone")} className="mt-1 bg-input" />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
          </div>
          
          <div className="border-t border-border/40 pt-6 space-y-6">
            <h3 className="text-lg font-semibold text-primary">Dettagli Orologio da Vendere</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="watchBrand" className="text-foreground/80">Marca Orologio</Label>
                    <Input id="watchBrand" {...register("watchBrand")} placeholder="Es. Rolex" className="mt-1 bg-input" />
                    {errors.watchBrand && <p className="text-sm text-destructive mt-1">{errors.watchBrand.message}</p>}
                </div>
                <div>
                    <Label htmlFor="watchModel" className="text-foreground/80">Modello Orologio</Label>
                    <Input id="watchModel" {...register("watchModel")} placeholder="Es. Submariner" className="mt-1 bg-input" />
                    {errors.watchModel && <p className="text-sm text-destructive mt-1">{errors.watchModel.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="watchYear" className="text-foreground/80">Anno Approssimativo</Label>
                    <Input id="watchYear" type="number" {...register("watchYear")} placeholder="Es. 2015" className="mt-1 bg-input" />
                    {errors.watchYear && <p className="text-sm text-destructive mt-1">{errors.watchYear.message}</p>}
                </div>
                <div>
                    <Label htmlFor="watchCondition" className="text-foreground/80">Condizione</Label>
                    <Controller
                        name="watchCondition"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="watchCondition" className="mt-1 bg-input"><SelectValue placeholder="Seleziona condizione" /></SelectTrigger>
                            <SelectContent className="bg-popover">
                                {watchConditionOptions.map(cond => (<SelectItem key={cond} value={cond}>{cond}</SelectItem>))}
                            </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.watchCondition && <p className="text-sm text-destructive mt-1">{errors.watchCondition.message}</p>}
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-x-3">
                    <Controller
                        name="hasBox"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id="hasBox" checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5" />
                        )}
                    />
                    <Label htmlFor="hasBox" className="text-foreground/80 font-normal flex items-center gap-1"><Box className="h-4 w-4 text-muted-foreground"/>Disponi della scatola originale?</Label>
                </div>
                 <div className="flex items-center gap-x-3">
                    <Controller
                        name="hasPapers"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id="hasPapers" checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5" />
                        )}
                    />
                    <Label htmlFor="hasPapers" className="text-foreground/80 font-normal flex items-center gap-1"><FileText className="h-4 w-4 text-muted-foreground"/>Disponi dei documenti/garanzia originali?</Label>
                </div>
            </div>
             <div>
                <Label htmlFor="desiredPrice" className="text-foreground/80">Prezzo Desiderato (€, Opzionale)</Label>
                <Input id="desiredPrice" type="number" step="0.01" {...register("desiredPrice")} placeholder="Es. 5000" className="mt-1 bg-input" />
                {errors.desiredPrice && <p className="text-sm text-destructive mt-1">{errors.desiredPrice.message}</p>}
            </div>
            <div>
                <Label htmlFor="additionalInfo" className="text-foreground/80">Informazioni Aggiuntive (Opzionale)</Label>
                <Textarea 
                    id="additionalInfo" 
                    {...register("additionalInfo")} 
                    placeholder="Eventuali dettagli su storia, revisioni, difetti, o link a foto..."
                    className="mt-1 min-h-[100px] bg-input" 
                />
                {errors.additionalInfo && <p className="text-sm text-destructive mt-1">{errors.additionalInfo.message}</p>}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Un nostro esperto valuterà la tua proposta e ti contatterà per discutere i prossimi passi. Non c'è obbligo di vendita.
          </p>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
