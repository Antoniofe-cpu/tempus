
'use client'; // Necessario per useEffect e useState

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WatchCard from '@/components/WatchCard';
import { Button } from '@/components/ui/button';
import { FilterIcon, ArrowDownUpIcon, Loader2 } from 'lucide-react';
import AiSuggestions from '@/components/AiSuggestions'; 
import type { Watch } from '@/lib/types';
import { getWatches } from '@/services/watchService';
import { useToast } from "@/hooks/use-toast";

// Metadata può essere esportato anche da un client component in versioni recenti di Next.js
// o definito in un file layout.tsx o page.tsx separato (se fosse server component)
// export const metadata = {
//   title: 'Occasioni Esclusive - Tempus Concierge',
//   description: 'Scopri la nostra selezione di orologi di lusso e pezzi rari.',
// };


export default function OccasioniPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchOccasioniWatches() {
      setIsLoading(true);
      try {
        const data = await getWatches();
        setWatches(data);
      } catch (error) {
        console.error("Errore nel caricamento degli orologi per le occasioni:", error);
        toast({
          title: "Errore Caricamento Dati",
          description: "Impossibile caricare gli orologi. Riprova più tardi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchOccasioniWatches();
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4">
            Occasioni <span className="text-accent">Esclusive</span>
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Esplora la nostra curata selezione di orologi di lusso, pezzi rari e offerte imperdibili per veri intenditori.
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Caricamento...' : `Mostrando ${watches.length} orologi`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <FilterIcon className="mr-2 h-4 w-4" /> Filtra
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <ArrowDownUpIcon className="mr-2 h-4 w-4" /> Ordina
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-16 w-16 text-accent animate-spin" />
          </div>
        ) : watches.length > 0 ? (
          <div role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {watches.map((watch) => (
              <WatchCard key={watch.id} watch={watch} /> 
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-xl mb-2">Nessun orologio disponibile al momento.</p>
            <p>Torna a trovarci presto per scoprire le nuove occasioni!</p>
          </div>
        )}
        
        <section className="mt-16 pt-12 border-t border-border/40">
           <h2 className="font-headline text-3xl md:text-4xl font-bold text-center text-primary mb-8">
            Suggerimenti <span className="text-accent">dall'Esperto AI</span>
          </h2>
          <AiSuggestions initialCriteria="orologi di lusso popolari e di tendenza nel 2024" context="occasioni" />
        </section>

      </main>
      <Footer />
    </div>
  );
}
