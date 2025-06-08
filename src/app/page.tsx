
'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, GemIcon, SearchIcon, ShieldCheckIcon, WatchIcon as LucideWatchIcon } from 'lucide-react'; // Renamed to avoid conflict
import React from 'react'; // Removed unused useState, useEffect
// Removed generateHeroImage import and Loader2 as AI image generation is replaced by static

export default function HomePage() {
  // Removed useState for heroImageUrl and isLoadingImage

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative py-20 md:py-32 text-center overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center justify-center">
          <div className="absolute inset-0 opacity-30">
            {/* Replaced AI generated image with a static placeholder */}
            <Image
              src="https://placehold.co/1920x1080.png?text=Tempus+Concierge+Collection"
              alt="Servizio esclusivo Tempus Concierge per orologi di lusso"
              fill
              style={{ objectFit: 'cover' }}
              quality={80}
              priority
              data-ai-hint="orologi lusso lifestyle vetrina"
            />
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
      </main>
      <Footer />
    </div>
  );
}
