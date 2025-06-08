
'use server';
/**
 * @fileOverview Flow per recuperare notizie altamente plausibili e dal suono fattuale sul mondo degli orologi, con un focus sull'ultimo mese.
 *
 * - fetchWatchNews - Funzione che restituisce una lista di notizie generate.
 * - FetchWatchNewsOutput - Tipo di output per la funzione fetchWatchNews.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NewsItemSchema = z.object({
  title: z.string().describe('Il titolo accattivante della notizia.'),
  summary: z.string().describe('Un breve riassunto della notizia (1-2 frasi).'),
  publishedDate: z.string().describe("La data di pubblicazione plausibile, MOLTO RECENTE (all'interno dell'ULTIMO MESE) della notizia (es. '15 Maggio 2024', 'Pochi giorni fa')."),
  sourceName: z.string().describe("Il nome di una fonte giornalistica o blog di settore plausibile da cui potrebbe provenire la notizia (es. 'WatchWorld Mag', 'Cronotempo Blog').").optional(),
});

const FetchWatchNewsOutputSchema = z.object({
  newsItems: z.array(NewsItemSchema).describe('Una lista di 3-4 notizie recenti e altamente plausibili sugli orologi, basate su fatti noti del settore. FONDAMENTALE: Le notizie devono sembrare annunciate ESCLUSIVAMENTE NELL\'ULTIMO MESE.'),
});
export type FetchWatchNewsOutput = z.infer<typeof FetchWatchNewsOutputSchema>;

export async function fetchWatchNews(): Promise<FetchWatchNewsOutput> {
  return fetchWatchNewsFlow();
}

const newsPrompt = ai.definePrompt({
  name: 'fetchWatchNewsPrompt',
  output: {schema: FetchWatchNewsOutputSchema},
  prompt: `Sei un redattore esperto di una prestigiosa rivista di orologeria di lusso.
Il tuo compito FONDAMENTALE è fornire 3-4 notizie che sembrino annunciate ESCLUSIVAMENTE NELL'ULTIMO MESE. Queste notizie devono essere PERFETTAMENTE PLAUSIBILI e basate su FATTI NOTI, MARCHI REALI (es. Rolex, Omega, Patek Philippe, Audemars Piguet, Cartier, Jaeger-LeCoultre, TAG Heuer, Breitling, IWC), MODELLI ESISTENTI e DINAMICHE TIPICHE del settore dell'alta orologeria.

Per ogni notizia, fornisci:
1. Un titolo accattivante e conciso.
2. Un breve sommario di 1-2 frasi che catturi l'essenza della notizia.
3. Una data di pubblicazione che sia INEQUIVOCABILMENTE all'interno dell'ULTIMO MESE (es. '22 Giugno 2024', 'La scorsa settimana', 'Pochi giorni fa'). Evita date troppo generiche o che potrebbero estendersi oltre l'ultimo mese. Non usare date future.
4. Opzionalmente, il nome di una fonte giornalistica o blog di settore plausibile da cui potrebbe provenire (es. 'Il Giornale degli Orologi', 'Hodinkee Report', 'LuxuryWatch Chronos').

BASA le tue notizie ESCLUSIVAMENTE su:
- Annunci di nuovi modelli o aggiornamenti significativi a collezioni esistenti da parte di marchi reali che *potrebbero* essere avvenuti nell'ultimo mese.
- Tendenze di mercato degne di nota e documentate che *potrebbero* essere state evidenziate nell'ultimo mese (es. sostenibilità nei materiali, aumento della domanda per specifici modelli vintage, utilizzo di nuove tecnologie in orologi esistenti).
- Riepiloghi di eventi importanti del settore (es. fiere di orologi come Watches and Wonders, risultati di aste per pezzi rari effettivamente battuti) che *potrebbero* essersi conclusi o riportati nell'ultimo mese.
- Collaborazioni tra marchi noti o tra un marchio di orologi e un'altra entità famosa (es. automotive, arte) che *potrebbero* essere state annunciate nell'ultimo mese.
- Innovazioni tecnologiche rilevanti applicate a modelli o movimenti di orologi conosciuti che *potrebbero* essere state rivelate nell'ultimo mese.

IMPORTANTE: NON DEVI INVENTARE marchi fittizi, modelli inesistenti, tecnologie puramente speculative o scenari completamente fantastici. Ogni elemento della notizia deve essere radicato nella realtà attuale o passata del mondo degli orologi di lusso. Punta alla massima autenticità e verosimiglianza, come se stessi riportando un fatto reale accaduto rigorosamente nell'ultimo mese.
Restituisci solo l'array di notizie nel formato JSON specificato.
Le notizie devono essere diverse tra loro e toccare aspetti differenti del settore (es. un nuovo modello, una tendenza, un risultato d'asta).
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

