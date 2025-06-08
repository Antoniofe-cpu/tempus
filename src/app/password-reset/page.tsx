
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, MailCheck } from 'lucide-react';
import Link from 'next/link';

const PasswordResetSchema = z.object({
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
});

type PasswordResetFormData = z.infer<typeof PasswordResetSchema>;

export default function PasswordResetPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordResetFormData>({
    resolver: zodResolver(PasswordResetSchema),
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    setIsLoading(true);
    setEmailSent(false);
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: "Email di Reset Inviata",
        description: "Controlla la tua casella di posta per le istruzioni su come resettare la password.",
      });
      setEmailSent(true);
      reset();
    } catch (error: any) {
      let errorMessage = "Si è verificato un errore. Riprova.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Nessun utente trovato con questa email. Verifica l'indirizzo inserito.";
      } else if (error.code === 'auth/missing-email'){
         errorMessage = "Inserisci il tuo indirizzo email.";
      }
      console.error("Errore invio email reset password:", error);
      toast({
        title: "Errore",
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
            <KeyRound className="mx-auto h-12 w-12 text-accent mb-4" />
            <CardTitle className="font-headline text-3xl text-primary">Resetta Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Inserisci la tua email per ricevere le istruzioni di reset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="text-center space-y-4 p-4 bg-green-500/10 rounded-md">
                <MailCheck className="mx-auto h-12 w-12 text-green-600" />
                <p className="text-green-700 dark:text-green-400 font-medium">
                  Email inviata! Controlla la tua casella di posta (anche la cartella spam).
                </p>
                <Button variant="outline" asChild>
                  <Link href="/login">Torna al Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-foreground/80">Indirizzo Email Registrato</Label>
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
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    "Invia Email di Reset"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
           <CardFooter className="text-sm text-center justify-center">
             {!emailSent && (
              <p className="text-muted-foreground">
                Ricordi la password?{' '}
                <Link href="/login" className="font-medium text-accent hover:underline">
                  Accedi
                </Link>
              </p>
             )}
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
