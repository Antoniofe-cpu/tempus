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
  // category: z.string().describe('Una possibile categoria per la notizia, es. "Nuove Uscite", "Mercato", "Eventi".'),
  // perceivedDate: z.string().describe('Una data percepita per la notizia, es. "Oggi", "Recente"'),
});

const FetchWatchNewsOutputSchema = z.object({
  newsItems: z.array(NewsItemSchema).describe('Una lista di 3-4 notizie recenti sugli orologi.'),
});
export type FetchWatchNewsOutput = z.infer<typeof FetchWatchNewsOutputSchema>;

export async function fetchWatchNews(): Promise<FetchWatchNewsOutput> {
  return fetchWatchNewsFlow();
}

const newsPrompt = ai.definePrompt({
  name: 'fetchWatchNewsPrompt',
  output: {schema: FetchWatchNewsOutputSchema},
  prompt: `Sei un redattore esperto di una prestigiosa rivista di orologeria di lusso. 
Il tuo compito è fornire le 3 notizie più recenti, rilevanti e interessanti dal mondo degli orologi. 
Le notizie devono sembrare estremamente attuali, come se fossero state pubblicate oggi o ieri.
Per ogni notizia, fornisci:
1. Un titolo accattivante e conciso.
2. Un breve sommario di 1-2 frasi che catturi l'essenza della notizia.

Concentrati su argomenti come nuove uscite significative, tendenze di mercato, eventi importanti, o innovazioni tecnologiche nel settore dell'alta orologeria. Assicurati che il tono sia professionale e informativo.
Evita di menzionare date specifiche a meno che non siano cruciali e possano essere genericamente recenti (es. "questa settimana").
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
