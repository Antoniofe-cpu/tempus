
'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WatchCard from '@/components/WatchCard';
// WatchNewsSection non è usato in questa pagina, rimosso l'import se presente altrove
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, GemIcon, SearchIcon, ShieldCheckIcon, WatchIcon as LucideWatchIcon, HandshakeIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Watch } from '@/lib/types';
import type { ServiceCard as ServiceCardType } from '@/lib/types';
import { getServiceCards } from '@/services/serviceCardService';
import { getWatches } from '@/services/watchService';
import { useToast } from "@/hooks/use-toast";

// Definizione corretta del ServiceCard component
interface ServiceCardProps {
  title: string;
  description: string;
  link: string;
  iconUrl?: string;
}

function ServiceCard({ title, description, link, iconUrl }: ServiceCardProps) {
  return (
    <Card className="flex flex-col items-center text-center p-6 bg-card shadow-xl hover:shadow-accent/20 transition-shadow duration-300 h-full">
      <CardHeader className="flex flex-col items-center pb-3">
        {iconUrl ? (
          <Image src={iconUrl} alt={`${title} icon`} width={48} height={48} className="mb-3 text-accent object-contain" data-ai-hint="servizio icona" />
        ) : (
          <HandshakeIcon className="h-12 w-12 text-accent mb-3" />
        )}
        <CardTitle className="font-headline text-xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <CardDescription className="text-foreground/70">{description}</CardDescription>
      </CardContent>
      <div className="mt-auto w-full">
        <Button asChild variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
          <Link href={link}>Scopri di più</Link>
        </Button>
      </div>
    </Card>
  );
}


export default function HomePage() {
  const [latestWatches, setLatestWatches] = useState<Watch[]>([]);
  const [isLoadingLatestWatches, setIsLoadingLatestWatches] = useState(true);
  const { toast } = useToast();
  const [serviceCards, setServiceCards] = useState<ServiceCardType[]>([]);
  const [isLoadingServiceCards, setIsLoadingServiceCards] = useState(true);

  const fetchLatestWatches = useCallback(async () => {
    setIsLoadingLatestWatches(true);
    try {
      const data = await getWatches(true); // Fetching only new arrivals
      setLatestWatches(data);
    } catch (error) {
      console.error("Errore nel caricamento degli ultimi orologi:", error);
      toast({
        title: "Errore Caricamento Dati",
        description: "Impossibile caricare gli ultimi orologi.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLatestWatches(false);
    }
  }, [toast]);

  const fetchServiceCardsData = useCallback(async () => {
    setIsLoadingServiceCards(true);
    try {
      const data = await getServiceCards();
      setServiceCards(data);
    } catch (error) {
      console.error("Errore nel caricamento delle card servizio:", error);
      toast({
        title: "Errore Caricamento Dati",
        description: "Impossibile caricare le informazioni sui servizi.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingServiceCards(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLatestWatches();
    fetchServiceCardsData();
  }, [fetchLatestWatches, fetchServiceCardsData]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative py-20 md:py-32 text-center overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center justify-center">
          <div className="absolute inset-0 opacity-30">
            <Image src="/Gemini_Generated_Image_h7li38h7li38h7li.jpeg" alt="Elegante collezione di orologi Tempus Concierge" fill style={{ objectFit: 'cover' }} quality={80} priority data-ai-hint="orologi lusso collezione" />
          </div>
          <div className="container relative z-10 mx-auto px-4">
            <LucideWatchIcon className="mx-auto h-20 w-20 text-accent mb-6 animate-pulse" />
            <h1 className="font-headline text-5xl md:text-7xl font-bold mb-6">
              Benvenuto in <span className="text-accent">Tempus Concierge</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto mb-10">
              Il tuo portale esclusivo per la ricerca e la consulenza di orologi da collezione e di lusso. Realizziamo i tuoi sogni, orologio dopo orologio.
            </p>
            <div className="space-x-0 space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold group">
                <Link href="/richiesta-personalizzata">
                  Inizia la Tua Ricerca
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10 hover:text-accent font-semibold group">
                <Link href="/occasioni">
                  Scopri lo Shop
                  <SearchIcon className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-16">
              Perché Scegliere <span className="text-accent">Noi</span>?
            </h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-xl hover:shadow-accent/20 transition-shadow duration-300">
                <GemIcon className="h-12 w-12 text-accent mb-4" />
                <h3 className="font-headline text-2xl font-semibold mb-2">Accesso Esclusivo</h3>
                <p className="text-foreground/70">
                  Grazie alla nostra rete globale, accediamo a pezzi rari e edizioni limitate difficili da trovare.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-xl hover:shadow-accent/20 transition-shadow duration-300">
                <LucideWatchIcon className="h-12 w-12 text-accent mb-4" />
                <h3 className="font-headline text-2xl font-semibold mb-2">Consulenza Esperta</h3>
                <p className="text-foreground/70">
                  Il nostro team di esperti ti guiderà nella scelta dell'orologio perfetto per le tue esigenze e il tuo stile.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-xl hover:shadow-accent/20 transition-shadow duration-300">
                <ShieldCheckIcon className="h-12 w-12 text-accent mb-4" />
                <h3 className="font-headline text-2xl font-semibold mb-2">Servizio Discreto e Sicuro</h3>
                <p className="text-foreground/70">
                  Garantiamo la massima discrezione e professionalità in ogni fase del processo di acquisto e consulenza.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted">
            <div className="container mx-auto px-4">
                <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-12">
                    <span className="text-accent">Nuovi</span> Arrivi
                </h2>
                {isLoadingLatestWatches ? (
                    <div className="flex justify-center items-center py-8">
                        <LucideWatchIcon className="h-12 w-12 text-accent animate-spin" />
                    </div>
                ) : latestWatches.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {latestWatches.map((watch) => (
                            <WatchCard key={watch.id} watch={watch} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p>Nessun nuovo arrivo disponibile al momento.</p>
                    </div>
                )}
                <div className="text-center mt-10">
                    <Button asChild size="lg">
                        <Link href="/shop">Vedi tutti gli orologi nello Shop</Link>
                    </Button>
                </div>
            </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-12">
                    I Nostri <span className="text-accent">Servizi</span>
                </h2>
                {isLoadingServiceCards ? (
                     <div className="col-span-full flex justify-center items-center py-8 w-full">
                      <LucideWatchIcon className="h-12 w-12 text-accent animate-spin" />
                    </div>
                ) : serviceCards.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {serviceCards.map((card) => (
                      <ServiceCard 
                        key={card.id} 
                        title={card.title} 
                        description={card.description} 
                        link={card.link} 
                        iconUrl={card.iconUrl} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>Informazioni sui servizi non disponibili al momento.</p>
                  </div>
                )}
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
