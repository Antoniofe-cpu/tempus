
'use client';

import { Suspense, useState } from 'react'; // Rimossa l'importazione duplicata di useState
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, type AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

const RegistrationFormSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  password: z.string().min(6, { message: "La password deve contenere almeno 6 caratteri." }),
  confirmPassword: z.string().min(6, { message: "Conferma la password." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Le password non coincidono.",
  path: ["confirmPassword"], 
});

type RegistrationFormData = z.infer<typeof RegistrationFormSchema>;

function RegistrazionePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegistrationFormData>({
    resolver: zodResolver(RegistrationFormSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, { displayName: data.name });
      }
      
      toast({
        title: "Registrazione Completata!",
        description: "Il tuo account è stato creato con successo.",
        variant: "default",
      });
      reset();
      
      const redirectUrl = searchParams.get('redirect');
      const fromForm = searchParams.get('fromForm') === 'true';
      const origin = searchParams.get('origin'); // es. 'requestForm', 'repairForm', 'sellForm'

      if (redirectUrl && fromForm && origin) {
        router.push(`${redirectUrl}?fromForm=true&origin=${origin}`);
      } else {
        router.push('/registrazione/successo');
      }

    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Si è verificato un errore durante la registrazione. Riprova.";
      if (authError.code === 'auth/email-already-in-use') {
        errorMessage = "Questa email è già registrata. Prova a fare il login.";
      } else if (authError.code === 'auth/weak-password') {
        errorMessage = "La password è troppo debole. Scegline una più sicura.";
      }
      console.error("Errore registrazione:", authError);
      toast({
        title: "Errore di Registrazione",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl bg-card border border-border/60">
          <CardHeader className="text-center">
            <UserPlus className="mx-auto h-12 w-12 text-accent mb-4" />
            <CardTitle className="font-headline text-3xl text-primary">Crea il Tuo Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Entra a far parte di Tempus Concierge per un'esperienza esclusiva.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-foreground/80">Nome Completo</Label>
                <Input 
                  id="name" 
                  {...register("name")} 
                  placeholder="Mario Rossi" 
                  className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" 
                  disabled={isLoading}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground/80">Indirizzo Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...register("email")} 
                  placeholder="mario.rossi@esempio.com" 
                  className="mt-1 bg-input border-border focus:border-accent focus:ring-accent"
                  disabled={isLoading}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password" className="text-foreground/80">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  {...register("password")} 
                  placeholder="Minimo 6 caratteri"
                  className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" 
                  disabled={isLoading}
                />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-foreground/80">Conferma Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  {...register("confirmPassword")} 
                  placeholder="Reinserisci la password"
                  className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" 
                  disabled={isLoading}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrazione in corso...
                  </>
                ) : (
                  "Registrati"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-sm">
             <p className="text-muted-foreground">
              Hai già un account?{' '}
              <Link 
                 href={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}&fromForm=${searchParams.get('fromForm') === 'true'}&origin=${searchParams.get('origin') || ''}` : ''}`} 
                className="font-medium text-accent hover:underline"
              >
                Accedi
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function RegistrazionePage() {
  return (
    <Suspense fallback={<div>Caricamento pagina di registrazione...</div>}> {/* Aggiunto fallback */}
      <RegistrazionePageContent />
    </Suspense>
  );
}

