
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RepairForm from '@/components/RepairForm'; // Importa il nuovo form
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Riparazione Orologi - Tempus Concierge',
  description: 'Richiedi un servizio di riparazione per il tuo orologio di lusso o da collezione.',
};

function RepairFormFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-20rem)]">
      <Loader2 className="h-12 w-12 text-accent animate-spin" />
      <p className="mt-4 text-muted-foreground">Caricamento modulo riparazione...</p>
    </div>
  );
}

export default function RiparaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <Suspense fallback={<RepairFormFallback />}>
          <RepairForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
