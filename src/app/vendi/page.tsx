
// src/app/vendi/page.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react'; // Usiamo DollarSign per "vendere"

export const metadata = {
  title: 'Vendi il Tuo Orologio - Tempus Concierge',
  description: 'Proponi il tuo orologio di lusso o da collezione per una valutazione e possibile vendita.',
};

export default function VendiPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16 flex items-center justify-center">
        <Card className="w-full max-w-2xl text-center shadow-xl bg-card border-border/60">
          <CardHeader>
            <DollarSign className="mx-auto h-16 w-16 text-accent mb-4" />
            <CardTitle className="font-headline text-4xl text-primary">Vendi il Tuo Orologio</CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Questa sezione è in fase di sviluppo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/80">
              Presto potrai utilizzare un modulo dedicato per proporci il tuo orologio.
              Nel frattempo, per richieste di vendita, ti preghiamo di contattarci tramite la sezione "Richiesta Personalizzata" specificando che desideri vendere.
            </p>
            {/* <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/richiesta-personalizzata">Vai a Richiesta Personalizzata</Link>
            </Button> */}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
