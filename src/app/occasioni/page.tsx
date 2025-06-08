
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WatchCard from '../../components/WatchCard';
import { Watch } from '../../lib/types';
import { getWatches } from '../../services/watchService';
// import WatchNewsSection from '@/components/WatchNewsSection'; // Rimosso import

const OccasioniPage = () => {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatches = async () => {
      try {
        const watchesData = await getWatches();
        setWatches(watchesData);
      } catch (err) {
        setError('Failed to fetch watches.');
        console.error('Error fetching watches:', err);
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
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-center mb-12 text-primary">
          Le Nostre <span className="text-accent">Occasioni</span>
        </h1>
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            <p className="ml-3 text-muted-foreground">Caricamento orologi...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-destructive bg-destructive/10 p-6 rounded-md">
            <p className="font-semibold">Errore nel caricamento degli orologi.</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && watches.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            <p className="text-xl">Nessun orologio disponibile al momento.</p>
            <p>Torna a trovarci presto!</p>
          </div>
        )}

        {!loading && !error && watches.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {watches.map((watch) => (
              <WatchCard key={watch.id} watch={watch} />
            ))}
          </div>
        )}
        
        {/* <WatchNewsSection /> Rimosso da qui */}
      </main>
      <Footer />
    </div>
  );
};

export default OccasioniPage;
