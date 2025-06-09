
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RequestForm from '@/components/RequestForm';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Richiesta Personalizzata - Tempus Concierge',
  description: 'Inoltra la tua richiesta personalizzata per trovare l\'orologio dei tuoi sogni.',
};

function RequestFormFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-20rem)]">
      <Loader2 className="h-12 w-12 text-accent animate-spin" />
      <p className="mt-4 text-muted-foreground">Caricamento modulo richiesta...</p>
    </div>
  );
}

export default function RichiestaPersonalizzataPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <Suspense fallback={<RequestFormFallback />}>
          <RequestForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
