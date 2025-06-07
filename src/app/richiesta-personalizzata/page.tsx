import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RequestForm from '@/components/RequestForm';

export const metadata = {
  title: 'Richiesta Personalizzata - Tempus Concierge',
  description: 'Inoltra la tua richiesta personalizzata per trovare l\'orologio dei tuoi sogni.',
};

export default function RichiestaPersonalizzataPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <RequestForm />
      </main>
      <Footer />
    </div>
  );
}
