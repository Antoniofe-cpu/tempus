
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Registrazione Completata - Tempus Concierge',
  description: 'Grazie per esserti registrato a Tempus Concierge.',
};

export default function RegistrazioneSuccessoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16 flex items-center justify-center">
        <Card className="w-full max-w-lg text-center shadow-xl bg-card border-border/60">
          <CardHeader>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="font-headline text-3xl text-primary">Registrazione Avvenuta con Successo!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Grazie per esserti unito a Tempus Concierge. Il tuo account è stato creato.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/80">
              Ora puoi esplorare le nostre occasioni esclusive o inviare una richiesta personalizzata.
              Se non sei stato reindirizzato automaticamente, puoi procedere al login.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/">Torna alla Home</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                <Link href="/login">Vai al Login</Link> 
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
