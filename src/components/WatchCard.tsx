
import Image from 'next/image';
import Link from 'next/link'; 
import type { Watch } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSignIcon, ShieldCheckIcon, EyeIcon } from 'lucide-react';

interface WatchCardProps {
  watch: Watch;
}

export default function WatchCard({ watch }: WatchCardProps) {
  const fallbackAiHint = watch.name.split(" ").slice(0, 2).join(" ").toLowerCase();
  
  return (
    <Card className="overflow-hidden flex flex-col h-full bg-card shadow-lg hover:shadow-accent/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      <Link href={`/shop/${watch.id}`} className="block cursor-pointer flex-grow">
        <>
          <CardHeader className="p-0 relative">
            <Image
              src={watch.imageUrl || 'https://placehold.co/600x400.png'}
              alt={watch.name}
              width={600}
              height={400}
              className="object-cover w-full h-64"
              data-ai-hint={watch.dataAiHint || fallbackAiHint}
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400.png'; 
                e.currentTarget.srcset = '';
              }}
            />
            {watch.isNewArrival && ( 
              <Badge variant="default" className="absolute top-3 left-3 bg-primary text-primary-foreground animate-pulse">
                NUOVO ARRIVO
              </Badge>
            )}
             {watch.rarity && !watch.isNewArrival && ( 
              <Badge variant="destructive" className="absolute top-3 right-3 bg-accent text-accent-foreground">
                {watch.rarity}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <CardTitle className="font-headline text-2xl mb-1 text-primary">{watch.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mb-3">{watch.brand}</CardDescription>
            <p className="text-foreground/80 text-sm mb-4 line-clamp-3 h-[3.75em]">{watch.description}</p>
            
            <div className="flex items-center text-lg font-semibold text-accent mb-2">
              <DollarSignIcon className="h-5 w-5 mr-1" />
              {watch.price.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
            </div>

            {watch.condition && (
              <div className="flex items-center text-sm text-muted-foreground">
                <ShieldCheckIcon className="h-4 w-4 mr-1 text-green-400" />
                Condizione: {watch.condition}
              </div>
            )}
          </CardContent>
        </>
      </Link>
      <CardFooter className="p-6 border-t border-border/40 mt-auto">
        <Button asChild variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
          <Link href={`/shop/${watch.id}`}>
            <EyeIcon className="mr-2 h-4 w-4" /> 
            Vedi Dettagli
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
