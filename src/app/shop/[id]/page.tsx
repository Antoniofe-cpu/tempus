
import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getWatchById } from '@/services/watchService';
import type { Watch } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TagIcon, PackageCheckIcon, LayersIcon, InfoIcon, ShoppingCart, CircleHelpIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const watch = await getWatchById(id);

  if (!watch) {
    return {
      title: 'Orologio Non Trovato - Tempus Concierge',
    };
  }

  return {
    title: `${watch.name} - ${watch.brand} | Tempus Concierge`,
    description: `Dettagli per ${watch.name}. ${watch.description.substring(0, 160)}...`,
    openGraph: {
      title: `${watch.name} - ${watch.brand}`,
      description: watch.description.substring(0, 200),
      images: [
        {
          url: watch.imageUrl,
          width: 600,
          height: 400,
          alt: watch.name,
        },
      ],
    },
  };
}

export default async function WatchDetailPage({ params }: Props) {
  const watch = await getWatchById(params.id);

  if (!watch) {
    notFound();
  }

  const fallbackAiHint = watch.name.split(" ").slice(0, 2).join(" ").toLowerCase();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 md:py-16">
        <div className="mb-8">
          <Button variant="outline" asChild className="text-muted-foreground hover:text-primary">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna allo Shop
            </Link>
          </Button>
        </div>

        <Card className="overflow-hidden shadow-xl bg-card border-border/60">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Colonna Immagine */}
            <div className="relative min-h-[300px] md:min-h-[400px] lg:min-h-[500px] bg-muted/30">
              <Image
                src={watch.imageUrl}
                alt={watch.name}
                fill
                className="object-contain p-4 md:p-8"
                data-ai-hint={watch.dataAiHint || fallbackAiHint}
                priority
                 onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400.png';
                    e.currentTarget.srcset = '';
                }}
              />
            </div>

            {/* Colonna Dettagli */}
            <div className="p-6 md:p-8 lg:p-10 flex flex-col">
              <div className="mb-3">
                <Badge variant="secondary" className="text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20">
                  {watch.brand}
                </Badge>
              </div>
              <h1 className="font-headline text-3xl lg:text-4xl font-bold text-primary mb-3">
                {watch.name}
              </h1>
              
              <p className="text-3xl lg:text-4xl font-bold text-accent mb-6">
                {watch.price.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
              </p>

              <div className="space-y-4 mb-6 text-foreground/80">
                {watch.condition && (
                  <div className="flex items-center">
                    <PackageCheckIcon className="h-5 w-5 mr-2 text-accent" />
                    <span><strong>Condizione:</strong> {watch.condition}</span>
                  </div>
                )}
                {watch.rarity && (
                  <div className="flex items-center">
                    <LayersIcon className="h-5 w-5 mr-2 text-accent" />
                    <span><strong>Rarità:</strong> {watch.rarity}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-accent" />
                  <span>
                    <strong>Disponibilità:</strong> {watch.stock > 0 ? `${watch.stock} pz.` : <span className="text-destructive font-semibold">Esaurito</span>}
                  </span>
                </div>
              </div>

              <div className="mb-6 flex-grow">
                <h2 className="text-xl font-semibold text-primary mb-2 flex items-center">
                    <InfoIcon className="h-5 w-5 mr-2 text-accent"/>
                    Descrizione
                </h2>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                  {watch.description}
                </p>
              </div>
              
              <div className="mt-auto pt-6 border-t border-border/40">
                <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground group">
                  <Link href={`/richiesta-personalizzata?watchName=${encodeURIComponent(watch.name)}&watchBrand=${encodeURIComponent(watch.brand)}`}>
                    <CircleHelpIcon className="mr-2 h-5 w-5" /> Richiedi Informazioni
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Hai domande su questo orologio? Contattaci per una consulenza personalizzata.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

