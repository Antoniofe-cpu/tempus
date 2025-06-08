'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Newspaper } from 'lucide-react';
import { getWatchNews } from '@/lib/actions';
import type { FetchWatchNewsOutput } from '@/ai/flows/fetch-watch-news-flow';

export default function WatchNewsSection() {
  const [newsData, setNewsData] = useState<FetchWatchNewsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getWatchNews();
        if (data.newsItems && data.newsItems.length > 0 && data.newsItems[0].title === "Errore di Caricamento Notizie") {
          setError(data.newsItems[0].summary);
          setNewsData({ newsItems: [] });
        } else {
          setNewsData(data);
        }
      } catch (e) {
        console.error("Failed to fetch watch news:", e);
        setError("Si è verificato un errore imprevisto nel caricamento delle notizie.");
        setNewsData({ newsItems: [] });
      } finally {
        setIsLoading(false);
      }
    }
    loadNews();
  }, []);

  return (
    <section className="mt-16 pt-12 border-t border-border/40">
      <h2 className="font-headline text-3xl md:text-4xl font-bold text-center text-primary mb-3">
        Ultime <span className="text-accent">Notizie</span>
      </h2>
      <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
        Rimani aggiornato con le ultime novità e tendenze dal mondo dell'alta orologeria, selezionate dalla nostra AI.
      </p>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-accent mb-3" />
          <p>Caricamento notizie...</p>
        </div>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive text-destructive max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Errore nel Caricamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={async () => {
              setIsLoading(true);
              setError(null);
              try {
                const data = await getWatchNews();
                 if (data.newsItems && data.newsItems.length > 0 && data.newsItems[0].title === "Errore di Caricamento Notizie") {
                    setError(data.newsItems[0].summary);
                    setNewsData({ newsItems: [] });
                } else {
                    setNewsData(data);
                }
              } catch (e) {
                setError("Impossibile ricaricare le notizie.");
              } finally {
                setIsLoading(false);
              }
            }} className="mt-4 border-destructive text-destructive hover:bg-destructive/20">
              Riprova
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && newsData && newsData.newsItems.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsData.newsItems.map((item, index) => (
            <Card key={index} className="bg-card shadow-lg hover:shadow-primary/10 transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-foreground/80">{item.summary}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && newsData && newsData.newsItems.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <Newspaper className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>Nessuna notizia disponibile al momento.</p>
        </div>
      )}
    </section>
  );
}
