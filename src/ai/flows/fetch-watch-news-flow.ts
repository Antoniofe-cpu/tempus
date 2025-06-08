
'use server';
/**
 * @fileOverview Flow per recuperare notizie recenti (generate da AI) sul mondo degli orologi.
 *
 * - fetchWatchNews - Funzione che restituisce una lista di notizie generate.
 * - FetchWatchNewsOutput - Tipo di output per la funzione fetchWatchNews.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NewsItemSchema = z.object({
  title: z.string().describe('Il titolo accattivante della notizia.'),
  summary: z.string().describe('Un breve riassunto della notizia (1-2 frasi).'),
});

const FetchWatchNewsOutputSchema = z.object({
  newsItems: z.array(NewsItemSchema).describe('Una lista di 3-4 notizie recenti e plausibili sugli orologi.'),
});
export type FetchWatchNewsOutput = z.infer<typeof FetchWatchNewsOutputSchema>;

export async function fetchWatchNews(): Promise<FetchWatchNewsOutput> {
  return fetchWatchNewsFlow();
}

const newsPrompt = ai.definePrompt({
  name: 'fetchWatchNewsPrompt',
  output: {schema: FetchWatchNewsOutputSchema},
  prompt: `Sei un redattore esperto di una prestigiosa rivista di orologeria di lusso. 
Il tuo compito è fornire 3-4 notizie altamente plausibili e dal suono fattuale dal mondo dell'alta orologeria.
Queste notizie devono sembrare estremamente attuali, come se fossero state pubblicate oggi o ieri.

Per ogni notizia, fornisci:
1. Un titolo accattivante e conciso.
2. Un breve sommario di 1-2 frasi che catturi l'essenza della notizia.

Basa le tue notizie su fatti noti, marchi reali (es. Rolex, Omega, Patek Philippe, Audemars Piguet, Cartier, Jaeger-LeCoultre), linee di orologi esistenti ed eventi o annunci tipici del settore. Esempi includono:
- Un importante marchio che annuncia un nuovo modello o un aggiornamento significativo a una collezione esistente.
- Una tendenza di mercato degna di nota (es. sostenibilità nei materiali, aumento della domanda per specifici modelli vintage).
- Un evento importante del settore (es. il riassunto di una fiera di orologi, il risultato di un'asta per un pezzo raro).
- Un'innovazione tecnologica rilevante per l'orologeria.

IMPORTANTE: NON inventare marchi fittizi, modelli o scenari completamente fantastici. Le notizie devono essere radicate nella realtà del mondo degli orologi di lusso. Punta all'autenticità e alla verosimiglianza.
Evita date specifiche a meno che non siano generiche e recenti (es. "questa settimana", "recentemente annunciato").
Restituisci solo l'array di notizie nel formato JSON specificato.
`,
});

const fetchWatchNewsFlow = ai.defineFlow(
  {
    name: 'fetchWatchNewsFlow',
    outputSchema: FetchWatchNewsOutputSchema,
  },
  async () => {
    const {output} = await newsPrompt();
    return output || { newsItems: [] };
  }
);
