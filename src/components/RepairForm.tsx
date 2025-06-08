
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { submitRepairRequest, type FormState } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircleIcon, SendIcon, Loader2, Wrench } from "lucide-react";
import { useFormStatus } from 'react-dom';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const RepairRequestSchemaClient = z.object({ // Schema per validazione client-side, potrebbe differire leggermente
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  phone: z.string().optional().refine(val => !val || /^[+]?[0-9\s-()]*$/.test(val), { message: "Numero di telefono non valido."}),
  watchBrand: z.string().min(1, { message: "La marca dell'orologio è obbligatoria." }),
  watchModel: z.string().min(1, { message: "Il modello dell'orologio è obbligatorio." }),
  watchSerialNumber: z.string().optional(),
  problemDescription: z.string().min(10, { message: "Descrivi il problema in almeno 10 caratteri." }),
});

type RepairRequestFormData = z.infer<typeof RepairRequestSchemaClient>;

const LOCAL_STORAGE_KEY_REPAIR_DATA = 'pendingRepairRequestData';
const LOCAL_STORAGE_KEY_REPAIR_REDIRECT = 'pendingRepairRedirectPath';

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
          Invia Richiesta di Riparazione <SendIcon className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export default function RepairForm() {
  const initialState: FormState = { message: '', success: false, issues: [] };
  const [actionState, formAction] = useActionState(submitRepairRequest, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<RepairRequestFormData>({
    resolver: zodResolver(RepairRequestSchemaClient),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      watchBrand: '',
      watchModel: '',
      watchSerialNumber: '',
      problemDescription: '',
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
        title: "Richiesta Inviata!",
        description: actionState.message,
        variant: "default",
      });
    } else if (actionState.message && !actionState.success && (actionState.issues || actionState.fields)) {
        toast({
            title: "Errore Invio Richiesta",
            description: actionState.message || "Controlla i campi del form.",
            variant: "destructive",
        });
    }
  }, [actionState, reset, toast]);

  useEffect(() => {
    if (authLoading) return; 

    const pendingDataString = localStorage.getItem(LOCAL_STORAGE_KEY_REPAIR_DATA);
    const pendingRedirectPath = localStorage.getItem(LOCAL_STORAGE_KEY_REPAIR_REDIRECT);
    const wasRedirectedFromAuth = searchParams.get('fromForm') === 'true' && searchParams.get('origin') === 'repairForm';

    if (currentUser) { 
      if (pendingDataString && pendingRedirectPath === pathname && wasRedirectedFromAuth) {
        try {
          const pendingData = JSON.parse(pendingDataString) as RepairRequestFormData;
          Object.keys(pendingData).forEach(key => {
            setValue(key as keyof RepairRequestFormData, pendingData[key as keyof RepairRequestFormData], { shouldValidate: true });
          });
          if (currentUser.displayName) setValue('name', currentUser.displayName, { shouldValidate: true });
          if (currentUser.email) setValue('email', currentUser.email, { shouldValidate: true });

          localStorage.removeItem(LOCAL_STORAGE_KEY_REPAIR_DATA);
          localStorage.removeItem(LOCAL_STORAGE_KEY_REPAIR_REDIRECT);
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.delete('fromForm');
          newSearchParams.delete('origin');
          router.replace(`${pathname}?${newSearchParams.toString()}`, { scroll: false });

          toast({ title: "Dati Ripristinati", description: "I dati della tua richiesta di riparazione sono stati ripristinati." });
        } catch (e) {
          console.error("Errore nel parsare pendingRepairRequestData:", e);
          localStorage.removeItem(LOCAL_STORAGE_KEY_REPAIR_DATA);
          localStorage.removeItem(LOCAL_STORAGE_KEY_REPAIR_REDIRECT);
        }
      } else {
        if (currentUser.displayName && !watch('name')) setValue('name', currentUser.displayName);
        if (currentUser.email && !watch('email')) setValue('email', currentUser.email);
      }
    }
  }, [currentUser, authLoading, setValue, pathname, router, toast, searchParams, watch]);

  const handleActualSubmit = async (data: RepairRequestFormData) => {
    if (!currentUser && !authLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY_REPAIR_DATA, JSON.stringify(data));
      localStorage.setItem(LOCAL_STORAGE_KEY_REPAIR_REDIRECT, pathname);
      toast({
        title: "Login Richiesto",
        description: "Per inviare la richiesta di riparazione devi effettuare il login o registrarti. I tuoi dati sono stati salvati temporaneamente.",
        duration: 7000,
      });
      router.push(`/login?redirect=${pathname}&fromForm=true&origin=repairForm`);
      return;
    }

    const formDataForAction = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
         if (typeof value === 'string') { // Tutti i campi sono stringhe o opzionali
          formDataForAction.append(key, value);
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
        <Wrench className="mx-auto h-12 w-12 text-accent mb-4" />
        <CardTitle className="font-headline text-4xl text-primary">Richiesta di Riparazione</CardTitle>
        <CardDescription className="text-muted-foreground text-lg">
          Compila il modulo per richiedere un intervento di riparazione per il tuo orologio.
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
              <Input id="name" {...register("name")} placeholder="Il tuo nome" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" 
                     readOnly={!!(currentUser && currentUser.displayName)} 
                     aria-disabled={!!(currentUser && currentUser.displayName)}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="text-foreground/80">Indirizzo Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="latua@email.com" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" 
                     readOnly={!!(currentUser && currentUser.email)}
                     aria-disabled={!!(currentUser && currentUser.email)}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-foreground/80">Numero di Telefono (Opzionale)</Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="+39 123 4567890" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
          </div>
          
          <div className="border-t border-border/40 pt-6 space-y-6">
            <h3 className="text-lg font-semibold text-primary">Dettagli Orologio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="watchBrand" className="text-foreground/80">Marca Orologio</Label>
                    <Input id="watchBrand" {...register("watchBrand")} placeholder="Es. Rolex, Omega" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
                    {errors.watchBrand && <p className="text-sm text-destructive mt-1">{errors.watchBrand.message}</p>}
                </div>
                <div>
                    <Label htmlFor="watchModel" className="text-foreground/80">Modello Orologio</Label>
                    <Input id="watchModel" {...register("watchModel")} placeholder="Es. Submariner, Speedmaster" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
                    {errors.watchModel && <p className="text-sm text-destructive mt-1">{errors.watchModel.message}</p>}
                </div>
            </div>
            <div>
                <Label htmlFor="watchSerialNumber" className="text-foreground/80">Numero Seriale (Opzionale)</Label>
                <Input id="watchSerialNumber" {...register("watchSerialNumber")} placeholder="Se conosciuto" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
                {errors.watchSerialNumber && <p className="text-sm text-destructive mt-1">{errors.watchSerialNumber.message}</p>}
            </div>
            <div>
                <Label htmlFor="problemDescription" className="text-foreground/80">Descrizione del Problema</Label>
                <Textarea 
                    id="problemDescription" 
                    {...register("problemDescription")} 
                    placeholder="Descrivi dettagliatamente il problema riscontrato con il tuo orologio..."
                    className="mt-1 min-h-[120px] bg-input border-border focus:border-accent focus:ring-accent" 
                />
                {errors.problemDescription && <p className="text-sm text-destructive mt-1">{errors.problemDescription.message}</p>}
            </div>
          </div>
          
          {/* Per ora, non aggiungiamo l'upload di foto per semplicità. Si potrebbe aggiungere un campo di testo per URL di immagini se necessario. */}
          {/* <div>
            <Label htmlFor="photoUrls" className="text-foreground/80">Link a Foto (Opzionale, separa più URL con una virgola)</Label>
            <Input id="photoUrls" {...register("photoUrls")} placeholder="https://esempio.com/foto1.jpg, https://esempio.com/foto2.jpg" className="mt-1" />
          </div> */}

          <p className="text-xs text-muted-foreground">
            Un nostro esperto valuterà la tua richiesta e ti contatterà per fornirti un preventivo e i dettagli del processo di riparazione.
          </p>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
