
'use client'; 

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WatchCard from '@/components/WatchCard';
import { Button } from '@/components/ui/button';
import { FilterIcon, ArrowDownUpIcon, Loader2 } from 'lucide-react';
import type { Watch } from '@/lib/types';
import { getWatches } from '@/services/watchService'; 
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import WatchNewsSection from '@/components/WatchNewsSection'; // Importa il nuovo componente


export default function OccasioniPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchOccasioniWatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getWatches(); 
      setWatches(data);
    } catch (error) {
      console.error("Errore nel caricamento degli orologi per le occasioni (Firestore):", error);
      toast({
        title: "Errore Caricamento Dati",
        description: "Impossibile caricare gli orologi da Firestore. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOccasioniWatches();
  }, [fetchOccasioniWatches]);

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
            {isLoading ? 'Caricamento orologi...' : `Mostrando ${watches.length} orologi da Firestore`}
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
            <p className="text-xl mb-2">Nessun orologio disponibile al momento su Firestore.</p>
            <p>
              Visita la sezione <Link href="/admin/orologi" className="font-semibold text-accent hover:underline">Gestione Orologi</Link> per aggiungere nuovi pezzi
              o per popolare il catalogo con dati di esempio se è la prima volta.
            </p>
          </div>
        )}
        
        <WatchNewsSection />

      </main>
      <Footer />
    </div>
  );
}

    
