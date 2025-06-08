
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Handshake } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  link: string;
  iconUrl?: string;
}

export default function ServiceCard({ title, description, link, iconUrl }: ServiceCardProps) {
  return (
    <Card className="flex flex-col h-full bg-card shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      {/* Sezione Icona Grande */}
      {iconUrl ? (
        <div className="relative h-48 w-full flex items-center justify-center bg-muted/30 p-4 rounded-t-lg overflow-hidden">
          <Image 
            src={iconUrl} 
            alt={`${title} icon`} 
            layout="fill" 
            objectFit="contain" 
            className="p-2" 
            onError={(e) => { 
              // In caso di errore nel caricamento dell'URL fornito, mostra un'icona di fallback grande
              e.currentTarget.style.display = 'none'; // Nasconde l'immagine rotta
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = "h-full w-full flex items-center justify-center text-primary";
                fallbackDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-handshake"><path d="M11 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5M7 18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2M17 18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5Z"/></svg>'; // Handshake SVG
                parent.appendChild(fallbackDiv);
              }
            }}
          />
        </div>
      ) : (
        <div className="relative h-48 w-full flex items-center justify-center bg-primary/10 text-primary rounded-t-lg p-4">
          <Handshake className="h-16 w-16" /> {/* Icona di fallback più grande */}
        </div>
      )}
      
      <CardHeader className="pb-3 pt-4"> {/* Ridotto padding per compattare un po' */}
        <CardTitle className="font-headline text-2xl text-primary text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <CardDescription className="text-foreground/80 line-clamp-4 text-center">{description}</CardDescription> {/* Aumentato line-clamp se necessario */}
      </CardContent>
      <CardFooter className="pt-4 border-t border-border/40">
        <Button asChild variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground group transition-colors">
          <Link href={link}>
            Scopri di più
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
