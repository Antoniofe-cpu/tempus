
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, type AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogInIcon } from 'lucide-react';

const LoginFormSchema = z.object({
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  password: z.string().min(1, { message: "La password è obbligatoria." }), // Min 1 perché Firebase gestisce la lunghezza minima
});

type LoginFormData = z.infer<typeof LoginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      toast({
        title: "Login Effettuato!",
        description: "Bentornato su Tempus Concierge.",
        variant: "default",
      });
      reset();
      router.push('/'); // Reindirizza alla homepage dopo il login
      // Potresti voler reindirizzare a /admin se l'utente è un admin, o a un profilo utente
      // Questo richiederà logica aggiuntiva per controllare i ruoli utente.

    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Si è verificato un errore durante il login. Riprova.";
      
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
        errorMessage = "Email o password non validi. Controlla i dati e riprova.";
      } else if (authError.code === 'auth/too-many-requests') {
        errorMessage = "Troppi tentativi di login falliti. Riprova più tardi.";
      }
      console.error("Errore login:", authError);
      toast({
        title: "Errore di Login",
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
            <LogInIcon className="mx-auto h-12 w-12 text-accent mb-4" />
            <CardTitle className="font-headline text-3xl text-primary">Accedi al Tuo Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Bentornato su Tempus Concierge.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="La tua password"
                  className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" 
                  disabled={isLoading}
                />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  "Accedi"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-sm">
             <p className="text-muted-foreground">
              Non hai un account?{' '}
              <Link href="/registrazione" className="font-medium text-accent hover:underline">
                Registrati
              </Link>
            </p>
            {/* TODO: Aggiungere link "Password dimenticata?" */}
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
