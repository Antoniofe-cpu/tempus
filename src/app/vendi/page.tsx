
// src/app/vendi/page.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SellForm from '@/components/SellForm'; // Importa il nuovo form
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Vendi il Tuo Orologio - Tempus Concierge',
  description: 'Proponi il tuo orologio di lusso o da collezione per una valutazione e possibile vendita.',
};

function SellFormFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-20rem)]">
      <Loader2 className="h-12 w-12 text-accent animate-spin" />
      <p className="mt-4 text-muted-foreground">Caricamento modulo vendita...</p>
    </div>
  );
}

export default function VendiPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <Suspense fallback={<SellFormFallback />}>
          <SellForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
