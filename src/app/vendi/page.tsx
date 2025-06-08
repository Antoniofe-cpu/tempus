
// src/app/vendi/page.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SellForm from '@/components/SellForm'; // Importa il nuovo form

export const metadata = {
  title: 'Vendi il Tuo Orologio - Tempus Concierge',
  description: 'Proponi il tuo orologio di lusso o da collezione per una valutazione e possibile vendita.',
};

export default function VendiPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <SellForm />
      </main>
      <Footer />
    </div>
  );
}
