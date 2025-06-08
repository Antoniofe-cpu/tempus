
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WatchCard from '../../components/WatchCard';
import { Watch } from '../../lib/types';
import { getWatches } from '../../services/watchService';
import { Loader2, AlertTriangle, ShoppingBag } from 'lucide-react'; // Aggiunto ShoppingBag

const ShopPage = () => {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const watchesData = await getWatches();
        setWatches(watchesData);
      } catch (err) {
        setError('Impossibile caricare gli orologi dallo shop.');
        console.error('Error fetching watches for shop:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12 md:mb-16">
          <ShoppingBag className="mx-auto h-16 w-16 text-accent mb-6" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
            Esplora la Nostra <span className="text-accent">Collezione</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
            Scopri una selezione curata di orologi di lusso e da collezione, pronti per trovare un nuovo polso.
          </p>
        </div>
        
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
            <p className="text-muted-foreground text-lg">Caricamento orologi in corso...</p>
            <p className="text-sm text-muted-foreground">Un momento di pazienza.</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-destructive bg-destructive/10 p-6 rounded-lg shadow-md max-w-lg mx-auto">
            <AlertTriangle className="mx-auto h-10 w-10 mb-3" />
            <p className="font-semibold text-xl">Errore nel Caricamento</p>
            <p className="mt-1">{error}</p>
            <p className="text-sm mt-2">Riprova più tardi o contatta l'assistenza.</p>
          </div>
        )}

        {!loading && !error && watches.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-xl font-semibold">Nessun orologio disponibile al momento.</p>
            <p className="mt-1">Il nostro catalogo è in continuo aggiornamento. Torna a trovarci presto!</p>
          </div>
        )}

        {!loading && !error && watches.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {watches.map((watch) => (
              <WatchCard key={watch.id} watch={watch} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ShopPage;
