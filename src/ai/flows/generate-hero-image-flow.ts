
'use server';
/**
 * @fileOverview Flow per generare un'immagine hero per la homepage.
 *
 * - generateHeroImage - Funzione che genera un'immagine e restituisce il suo data URI.
 * - GenerateHeroImageInput - Tipo di input per la funzione generateHeroImage.
 * - GenerateHeroImageOutput - Tipo di output per la funzione generateHeroImage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHeroImageInputSchema = z.object({
  prompt: z.string().optional().describe("Il prompt per la generazione dell'immagine. Se non fornito, ne verrà usato uno di default."),
});
export type GenerateHeroImageInput = z.infer<typeof GenerateHeroImageInputSchema>;

const GenerateHeroImageOutputSchema = z.object({
  imageUrl: z.string().describe("Il Data URI dell'immagine generata (es. 'data:image/png;base64,...')."),
});
export type GenerateHeroImageOutput = z.infer<typeof GenerateHeroImageOutputSchema>;

export async function generateHeroImage(input: GenerateHeroImageInput): Promise<GenerateHeroImageOutput> {
  return generateHeroImageFlow(input);
}

const generateHeroImageFlow = ai.defineFlow(
  {
    name: 'generateHeroImageFlow',
    inputSchema: GenerateHeroImageInputSchema,
    outputSchema: GenerateHeroImageOutputSchema,
  },
  async (input) => {
    const imagePrompt = input.prompt || "Un'immagine di alta qualità di un meccanismo di orologio di lusso, estremamente dettagliato, che mostri ingranaggi, rubini e metallo lucido. Illuminazione cinematografica, drammatica.";
    
    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Modello specifico per la generazione di immagini
        prompt: imagePrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // Richiede sia testo che immagine
        },
      });

      if (media?.url) {
        return { imageUrl: media.url };
      } else {
        console.error('Image generation did not return a media URL.');
        // Potresti voler restituire un URL di placeholder o sollevare un errore più specifico
        return { imageUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" }; // Immagine trasparente 1x1
      }
    } catch (error) {
      console.error("Errore durante la generazione dell'immagine AI:", error);
      // Restituisce un'immagine placeholder trasparente in caso di errore
      return { imageUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" };
    }
  }
);
