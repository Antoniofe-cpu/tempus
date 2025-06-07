'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { getAiWatchSuggestions } from '@/lib/actions';
import { type SuggestWatchesOutput } from '@/ai/flows/suggest-watches';

interface AiSuggestionsProps {
  initialCriteria?: string;
  onSuggestionClick?: (suggestion: string) => void;
  context?: 'form' | 'occasioni';
  triggerFetch?: (criteria: string) => void; // Allow parent to trigger fetch
}

export default function AiSuggestions({ initialCriteria, onSuggestionClick, context = 'form', triggerFetch }: AiSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentCriteria, setCurrentCriteria] = useState(initialCriteria || '');

  const fetchSuggestions = useCallback((criteriaToUse: string) => {
    if (!criteriaToUse || !criteriaToUse.trim()) {
      setSuggestions([]);
      setError(null);
      return;
    }
    setCurrentCriteria(criteriaToUse);
    startTransition(async () => {
      setError(null);
      try {
        const result: SuggestWatchesOutput = await getAiWatchSuggestions(criteriaToUse);
        if (result.suggestions && result.suggestions.length > 0) {
          // Check if the first suggestion is an error message from the action
          if (result.suggestions[0].toLowerCase().includes("errore")) {
            setError(result.suggestions[0]);
            setSuggestions([]);
          } else {
            setSuggestions(result.suggestions);
          }
        } else {
          setSuggestions([]);
          setError("Nessun suggerimento trovato per i criteri forniti.");
        }
      } catch (e) {
        setError("Impossibile caricare i suggerimenti AI. Riprova più tardi.");
        setSuggestions([]);
      }
    });
  }, [startTransition]);


  useEffect(() => {
    if (initialCriteria && context === 'occasioni') {
      fetchSuggestions(initialCriteria);
    }
  }, [initialCriteria, context, fetchSuggestions]);
  
  useEffect(() => {
    if (triggerFetch && context === 'form') {
       (window as any).triggerAiSuggestionsGlobal = fetchSuggestions;
    }
    return () => {
      if (context === 'form' && (window as any).triggerAiSuggestionsGlobal) {
        delete (window as any).triggerAiSuggestionsGlobal;
      }
    }
  }, [triggerFetch, context, fetchSuggestions]);


  if (context === 'occasioni' && !isPending && suggestions.length === 0 && !error && !initialCriteria) {
    return null; 
  }
   if (context === 'occasioni' && !isPending && suggestions.length === 0 && !error && initialCriteria && !currentCriteria) {
    // This case is when initialCriteria is present for 'occasioni' but fetch hasn't run yet,
    // or if it ran and found nothing, which should be handled by the error/no suggestions states.
    // If initialCriteria is set but currentCriteria is not, it means fetch hasn't been called for it yet.
    // The useEffect for 'occasioni' context handles this.
     return null;
  }


  return (
    <Card className="bg-card shadow-lg border border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline text-primary">
          <Sparkles className="mr-2 h-6 w-6 text-accent" />
          {context === 'form' ? 'Suggerimenti AI' : 'Ispirazione dall\'Esperto'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {context === 'form' && (
          <p className="text-sm text-muted-foreground mb-4">
            Non sai da dove iniziare? Inserisci alcuni criteri nella sezione "Descrivi la tua richiesta" e clicca il bottone apposito per ricevere dei suggerimenti!
          </p>
        )}
        {isPending && (
          <div className="flex items-center justify-center p-6 text-muted-foreground">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-accent" />
            Caricamento suggerimenti...
          </div>
        )}
        {error && !isPending && (
          <div className="flex items-center p-4 text-destructive bg-destructive/10 rounded-md">
            <AlertTriangle className="mr-2 h-5 w-5" />
            {error}
          </div>
        )}
        {!isPending && !error && suggestions.length > 0 && (
          <ul className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <li key={index} 
                  className={`p-3 border border-border rounded-md hover:border-accent transition-colors ${onSuggestionClick ? 'cursor-pointer hover:bg-accent/10' : ''}`}
                  onClick={() => onSuggestionClick?.(suggestion)}>
                <p className="text-foreground">{suggestion}</p>
              </li>
            ))}
          </ul>
        )}
        {!isPending && !error && suggestions.length === 0 && currentCriteria && (
           <p className="text-sm text-muted-foreground p-4">Nessun suggerimento per "{currentCriteria}". Prova a modificare i criteri.</p>
        )}
         {!isPending && !error && suggestions.length === 0 && !currentCriteria && context === 'form' && (
           <p className="text-sm text-muted-foreground p-4">Inserisci dei criteri e clicca "Ottieni Suggerimenti AI" per iniziare.</p>
        )}
      </CardContent>
    </Card>
  );
}
