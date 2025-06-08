
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RepairForm from '@/components/RepairForm'; // Importa il nuovo form

export const metadata = {
  title: 'Riparazione Orologi - Tempus Concierge',
  description: 'Richiedi un servizio di riparazione per il tuo orologio di lusso o da collezione.',
};

export default function RiparaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <RepairForm />
      </main>
      <Footer />
    </div>
  );
}
