
import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getWatchById } from '@/services/watchService';
import type { Watch } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PackageCheckIcon, LayersIcon, ShoppingCart, MessageSquareQuote, CaseSensitive, WatchIcon, Anchor, Activity, Palette, Ruler, Calendar, LinkIcon, ShieldQuestion, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WatchDetailImage from '@/components/WatchDetailImage';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from 'next/image'; // Per le immagini aggiuntive

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
    description: `Dettagli per ${watch.name}. ${watch.description ? watch.description.substring(0, 160) : ''}...`,
    openGraph: {
      title: `${watch.name} - ${watch.brand}`,
      description: watch.description ? watch.description.substring(0, 200) : '',
      images: [
        {
          url: watch.imageUrl || 'https://placehold.co/600x400.png',
          width: 600,
          height: 400,
          alt: watch.name,
        },
        ...(watch.additionalImageUrls?.map(url => ({ url, width: 600, height: 400, alt: `${watch.name} - immagine aggiuntiva` })) || [])
      ],
    },
  };
}

export default async function WatchDetailPage({ params }: Props) {
  const watch = await getWatchById(params.id);

  if (!watch) {
    notFound();
  }

  const fallbackAiHint = watch.name ? watch.name.split(" ").slice(0, 2).join(" ").toLowerCase() : "watch detail";

  const features = [
    { label: "Referenza", value: watch.referenceNumber, icon: <span><LinkIcon /></span> },
    { label: "Anno di Produzione", value: watch.yearOfProduction?.toString(), icon: <span><Calendar /></span> },
    { label: "Materiale Cassa", value: watch.caseMaterial, icon: <span><CaseSensitive /></span> },
    { label: "Diametro Cassa", value: watch.caseDiameter, icon: <span><Ruler /></span> },
    { label: "Spessore Cassa", value: watch.caseThickness, icon: <span><Ruler /></span> },
    { label: "Impermeabilità", value: watch.waterResistance, icon: <span><Anchor /></span> },
    { label: "Materiale Lunetta", value: watch.bezelMaterial, icon: <span><ShieldQuestion /></span> },
    { label: "Vetro", value: watch.crystalType, icon: <span><Sparkles /></span> },
    { label: "Colore Quadrante", value: watch.dialColor, icon: <span><Palette /></span> },
    { label: "Indici Quadrante", value: watch.dialMarkers, icon: <span><Palette /></span> },
    { label: "Movimento", value: watch.movementType, icon: <span><WatchIcon /></span> },
    { label: "Calibro", value: watch.caliber, icon: <span><Activity /></span> },
    { label: "Riserva di Carica", value: watch.powerReserve, icon: <span><Activity /></span> },
    { label: "Materiale Cinturino", value: watch.braceletMaterial, icon: <span><LinkIcon /></span> },
    { label: "Larghezza Anse", value: watch.lugWidth, icon: <span><Ruler /></span> },
    { label: "Chiusura", value: watch.claspType, icon: <span><LinkIcon /></span> },
    { label: "Funzioni", value: watch.functions?.join(', '), icon: <span><LayersIcon /></span> },
    { label: "Complicazioni", value: watch.complications?.join(', '), icon: <span><LayersIcon /></span> },
    // Ensure all new characteristics from the Watch type are included here
    // (The list above seems to already cover most added fields based on your previous request)
    // If there are other fields in your Watch type not listed above, add them here.
  ].filter(feature => feature.value && feature.value.length > 0);


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
            <div className="relative min-h-[300px] md:min-h-[400px] lg:min-h-[500px] bg-muted/30 p-4">
              <WatchDetailImage
                src={watch.imageUrl || 'https://placehold.co/600x400.png'}
                alt={watch.name || 'Dettaglio orologio'}
                data-ai-hint={watch.dataAiHint || fallbackAiHint}
              />
              {/* Galleria Immagini Aggiuntive Semplice */}
              {watch.additionalImageUrls && watch.additionalImageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {watch.additionalImageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square bg-muted rounded-md overflow-hidden border border-border/50">
                      <Image
                        src={url}
                        alt={`${watch.name} - Immagine aggiuntiva ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100.png'; e.currentTarget.srcset = ''; }}
                        data-ai-hint={fallbackAiHint}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Colonna Dettagli */}
            <div className="p-6 md:p-8 lg:p-10 flex flex-col">
              <div className="mb-3">
                <Badge variant="secondary" className="text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20">
                  {watch.brand}
                </Badge>
                {watch.isNewArrival && (
                    <Badge variant="default" className="ml-2 bg-accent text-accent-foreground animate-pulse">
                        NUOVO ARRIVO
                    </Badge>
                )}
              </div>
              <h1 className="font-headline text-3xl lg:text-4xl font-bold text-primary mb-3">
                {watch.name}
              </h1>
              
              <p className="text-3xl lg:text-4xl font-bold text-accent mb-6">
                {(watch.price || 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
              </p>

              <div className="space-y-3 mb-6 text-foreground/80">
                {watch.condition && (
                  <div className="flex items-center">
                    <PackageCheckIcon className="h-5 w-5 mr-2 text-accent flex-shrink-0" />
                    <span><strong>Condizione:</strong> {watch.condition}</span>
                  </div>
                )}
                {watch.rarity && (
                  <div className="flex items-center">
                    <LayersIcon className="h-5 w-5 mr-2 text-accent flex-shrink-0" />
                    <span><strong>Rarità:</strong> {watch.rarity}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-accent flex-shrink-0" />
                  <span>
                    <strong>Disponibilità:</strong> {(watch.stock || 0) > 0 ? `${watch.stock} pz.` : <span className="text-destructive font-semibold">Esaurito</span>}
                  </span>
                </div>
              </div>

              <div className="mb-6 flex-grow">
                {/* Description section: no blue styling or 'i' icon needed */}
                <h2 className="text-xl font-semibold text-primary mb-2">
                    Descrizione Prodotto
                </h2>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                  {watch.description || "Nessuna descrizione fornita."}
                </p>
              </div>

              {features.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-primary mb-3">
                        {/* Collapsible section for detailed features */}
                        Caratteristiche Dettagliate
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        {features.map((feature, index) => feature.value && (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-base hover:no-underline">
                                    <div className="flex items-center">
                                        {feature.icon} {/* Render the icon component here */}
                                        {feature.label}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-foreground/70 pl-9">
                                    {feature.value}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
              )}
              
              <div className="mt-auto pt-6 border-t border-border/40">
                <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground group">
                  <Link href={`/richiesta-personalizzata?watchName=${encodeURIComponent(watch.name)}&watchBrand=${encodeURIComponent(watch.brand)}&watchRef=${encodeURIComponent(watch.referenceNumber || '')}`}>
                    {/* Changed button text to "Trattativa in Privato" */}
                    <MessageSquareQuote className=\"mr-2 h-5 w-5\" /> Trattativa in Privato
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Interessato? Contattaci per una consulenza o per avviare una trattativa.
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

    