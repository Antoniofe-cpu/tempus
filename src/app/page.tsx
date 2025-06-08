
'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, GemIcon, SearchIcon, ShieldCheckIcon, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { generateHeroImage } from '@/ai/flows/generate-hero-image-flow';
import { WatchIcon } from 'lucide-react';

export default function HomePage() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  useEffect(() => {
    async function fetchHeroImage() {
      setIsLoadingImage(true);
      try {
        const result = await generateHeroImage({ 
          prompt: "Un'immagine di altissima qualità che evoca lusso, precisione ed esclusività nel mondo degli orologi da collezione. Uno scorcio di un laboratorio di un maestro orologiaio, con strumenti di precisione, ingranaggi scintillanti e un orologio capolavoro in fase di assemblaggio. Illuminazione calda e sofisticata, stile cinematografico." 
        });
        if (result.imageUrl && result.imageUrl !== "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7") {
          setHeroImageUrl(result.imageUrl);
        } else {
          // Fallback se il flow AI restituisce l'immagine placeholder (errore interno al flow)
          setHeroImageUrl("https://placehold.co/1920x1080.png?text=Tempus+Concierge+Collection");
        }
      } catch (error) {
        // Questo blocco viene eseguito se la chiamata alla Server Action generateHeroImage fallisce.
        // Controllare i log di Firebase App Hosting per errori relativi all'esecuzione del flow Genkit.
        // Possibili cause: API Google AI non abilitata, problemi di fatturazione, permessi del service account.
        console.error("Failed to call generateHeroImage Server Action:", error);
        setHeroImageUrl("https://placehold.co/1920x1080.png?text=Immagine+Momentaneamente+Non+Disponibile");
      } finally {
        setIsLoadingImage(false);
      }
    }
    fetchHeroImage();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative py-20 md:py-32 text-center overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center justify-center">
          <div className="absolute inset-0 opacity-30">
            {isLoadingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader2 className="h-12 w-12 text-accent animate-spin" />
              </div>
            )}
            {heroImageUrl && (
              <Image
                src={heroImageUrl}
                alt="Servizio esclusivo Tempus Concierge per orologi di lusso"
                fill
                style={{ objectFit: 'cover' }}
                quality={80}
                priority
                data-ai-hint="orologi lusso meccanismo dettagliato"
              />
            )}
             {!heroImageUrl && !isLoadingImage && ( 
              // Fallback se heroImageUrl è ancora null dopo il tentativo di caricamento (ma non c'è stato un errore esplicito nel catch)
              // o se heroImageUrl è stato intenzionalmente impostato su una stringa vuota o null altrove.
              <Image
                src="https://placehold.co/1920x1080.png?text=Tempus+Concierge"
                alt="Placeholder Tempus Concierge"
                fill
                style={{ objectFit: 'cover' }}
                quality={80}
                data-ai-hint="orologi lusso concierge"
              />
            )}
          </div>
          <div className="container relative z-10 mx-auto px-4">
            <WatchIcon className="mx-auto h-20 w-20 text-accent mb-6 animate-pulse" />
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
                  Scopri le Occasioni
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
                <WatchIcon className="h-12 w-12 text-accent mb-4" />
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
      </main>
      <Footer />
    </div>
  );
}
