'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCircle, Mail, Edit3 } from 'lucide-react';

export default function ProfiloPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login?redirect=/profilo'); // Reindirizza se non loggato
      }
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 md:py-16 flex items-center justify-center">
          <Loader2 className="h-16 w-16 text-accent animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    // Questo stato non dovrebbe essere raggiunto a causa del redirect nell'useEffect
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 md:py-16 flex items-center justify-center">
          <p className="text-muted-foreground">Per favore, effettua il login per vedere il tuo profilo.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <Card className="w-full max-w-2xl mx-auto shadow-xl bg-card border-border/60">
          <CardHeader className="text-center">
            <UserCircle className="mx-auto h-20 w-20 text-accent mb-4" />
            <CardTitle className="font-headline text-3xl text-primary">Il Mio Profilo</CardTitle>
            <CardDescription className="text-muted-foreground">
              Visualizza e gestisci le informazioni del tuo account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-foreground/90">Informazioni Personali</h3>
              <div className="p-4 border rounded-md bg-muted/30 space-y-2">
                <div className="flex items-center">
                  <UserCircle className="h-5 w-5 mr-3 text-muted-foreground" />
                  <p><span className="font-medium text-foreground/80">Nome:</span> {user.displayName || 'Non specificato'}</p>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                  <p><span className="font-medium text-foreground/80">Email:</span> {user.email}</p>
                </div>
              </div>
            </div>
            
            {/* Qui potresti aggiungere altre sezioni, es. cronologia richieste, orologi salvati, etc. */}
            
            <div className="text-center">
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                <Edit3 className="mr-2 h-4 w-4" /> Modifica Profilo (Non implementato)
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border/40">
              <h3 className="font-semibold text-lg text-foreground/90 mb-2">Impostazioni Account</h3>
              <Button variant="link" className="p-0 h-auto text-destructive hover:underline">
                Elimina Account (Non implementato)
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}