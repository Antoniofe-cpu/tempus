import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WatchCard from '@/components/WatchCard';
import type { Watch } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FilterIcon, ArrowDownUpIcon } from 'lucide-react';
import AiSuggestions from '@/components/AiSuggestions'; 

const featuredWatches: Watch[] = [
  {
    id: '1',
    name: 'Rolex Submariner Date',
    brand: 'Rolex',
    price: 13500,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'Rolex Submariner',
    description: 'Iconico orologio subacqueo, un classico intramontabile per ogni collezione.',
    rarity: 'Molto Richiesto',
    condition: 'Nuovo',
  },
  {
    id: '2',
    name: 'Omega Speedmaster Professional',
    brand: 'Omega',
    price: 7200,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'Omega Speedmaster',
    description: 'Il leggendario "Moonwatch", un pezzo di storia al polso.',
    condition: 'Mint',
  },
  {
    id: '3',
    name: 'Patek Philippe Nautilus 5711',
    brand: 'Patek Philippe',
    price: 150000,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'Patek Nautilus',
    description: 'Eleganza sportiva e design inconfondibile, un vero status symbol.',
    rarity: 'Ultra Raro',
    condition: 'Pre-owned Certificato',
  },
  {
    id: '4',
    name: 'Audemars Piguet Royal Oak',
    brand: 'Audemars Piguet',
    price: 55000,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'Audemars RoyalOak',
    description: 'Design audace e finiture impeccabili per un orologio che non passa inosservato.',
    condition: 'Nuovo',
  },
];

export const metadata = {
  title: 'Occasioni Esclusive - Tempus Concierge',
  description: 'Scopri la nostra selezione di orologi di lusso e pezzi rari.',
};

export default function OccasioniPage() {
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
          <p className="text-sm text-muted-foreground">Mostrando {featuredWatches.length} orologi</p>
          <div className="flex gap-2">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <FilterIcon className="mr-2 h-4 w-4" /> Filtra
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <ArrowDownUpIcon className="mr-2 h-4 w-4" /> Ordina
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {featuredWatches.map((watch) => (
            <WatchCard key={watch.id} watch={watch} />
          ))}
        </div>
        
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
