// src/ai/flows/suggest-watches.ts
'use server';
/**
 * @fileOverview A flow for suggesting watch makes and models based on user criteria.
 *
 * - suggestWatches - A function that takes initial criteria and suggests popular watch makes and models.
 * - SuggestWatchesInput - The input type for the suggestWatches function.
 * - SuggestWatchesOutput - The return type for the suggestWatches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWatchesInputSchema = z.object({
  criteria: z
    .string()
    .describe(
      'The user provided criteria for the watch request, including desired style, features, and price range.'
    ),
});

export type SuggestWatchesInput = z.infer<typeof SuggestWatchesInputSchema>;

const SuggestWatchesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested watch makes and models based on the input criteria.'),
});

export type SuggestWatchesOutput = z.infer<typeof SuggestWatchesOutputSchema>;

export async function suggestWatches(input: SuggestWatchesInput): Promise<SuggestWatchesOutput> {
  return suggestWatchesFlow(input);
}

const suggestWatchesPrompt = ai.definePrompt({
  name: 'suggestWatchesPrompt',
  input: {schema: SuggestWatchesInputSchema},
  output: {schema: SuggestWatchesOutputSchema},
  prompt: `Based on the following criteria: {{{criteria}}}, suggest 5 popular watch makes and models that the user might be interested in. Return a JSON array of strings.`, 
});

const suggestWatchesFlow = ai.defineFlow(
  {
    name: 'suggestWatchesFlow',
    inputSchema: SuggestWatchesInputSchema,
    outputSchema: SuggestWatchesOutputSchema,
  },
  async input => {
    const {output} = await suggestWatchesPrompt(input);
    return output!;
  }
);
