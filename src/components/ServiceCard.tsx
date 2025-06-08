
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Handshake } from 'lucide-react'; // Handshake come icona di default

interface ServiceCardProps {
  title: string;
  description: string;
  link: string;
  iconUrl?: string;
}

export default function ServiceCard({ title, description, link, iconUrl }: ServiceCardProps) {
  return (
    <Card className="flex flex-col h-full bg-card shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      <CardHeader className="pb-4">
        {iconUrl ? (
          <div className="relative h-12 w-12 mb-3 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            <Image src={iconUrl} alt={`${title} icon`} width={32} height={32} className="object-contain" />
          </div>
        ) : (
          <div className="h-12 w-12 mb-3 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Handshake className="h-7 w-7" />
          </div>
        )}
        <CardTitle className="font-headline text-2xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-foreground/80 line-clamp-3">{description}</CardDescription>
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
