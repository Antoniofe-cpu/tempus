'use server';

import { z } from 'zod';
import type { PersonalizedRequest } from './types';
import { suggestWatches as genAISuggestWatches, type SuggestWatchesInput, type SuggestWatchesOutput } from '@/ai/flows/suggest-watches';

// Schema for personalized request form validation
const PersonalizedRequestSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  watchType: z.string().min(1, { message: "Seleziona un tipo di orologio." }),
  desiredBrand: z.string().optional(),
  desiredModel: z.string().optional(),
  budgetMin: z.coerce.number().min(0).optional(),
  budgetMax: z.coerce.number().min(0).optional(),
  aiCriteria: z.string().max(500, {message: "La descrizione per AI non può superare i 500 caratteri."}).optional(),
  additionalNotes: z.string().max(1000, {message: "Le note aggiuntive non possono superare i 1000 caratteri."}).optional(),
}).refine(data => !data.budgetMin || !data.budgetMax || data.budgetMax >= data.budgetMin, {
  message: "Il budget massimo deve essere maggiore o uguale al budget minimo.",
  path: ["budgetMax"],
});


export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  success: boolean;
};

export async function submitPersonalizedRequest(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  const parsed = PersonalizedRequestSchema.safeParse(formData);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message);
    return {
      message: "Errore nella validazione dei dati. Controlla i campi evidenziati.",
      fields: formData as Record<string, string>,
      issues,
      success: false,
    };
  }

  const requestData: PersonalizedRequest = {
    name: parsed.data.name,
    email: parsed.data.email,
    watchType: parsed.data.watchType,
    desiredBrand: parsed.data.desiredBrand,
    desiredModel: parsed.data.desiredModel,
    budget: parsed.data.budgetMin && parsed.data.budgetMax ? [parsed.data.budgetMin, parsed.data.budgetMax] : undefined,
    aiCriteria: parsed.data.aiCriteria,
    additionalNotes: parsed.data.additionalNotes,
    status: 'Nuova',
    createdAt: new Date(),
  };

  // Here you would typically save the requestData to a database.
  // For now, we'll just log it and simulate success.
  console.log('Richiesta Personalizzata Ricevuta:', requestData);

  // Simulate payment processing or next steps
  // For now, just return a success message.
  return { message: `Grazie ${parsed.data.name}, la tua richiesta è stata inviata con successo! Ti contatteremo presto.`, success: true };
}


export async function getAiWatchSuggestions(criteria: string): Promise<SuggestWatchesOutput> {
  if (!criteria || criteria.trim() === "") {
    return { suggestions: [] };
  }
  try {
    const input: SuggestWatchesInput = { criteria };
    const result = await genAISuggestWatches(input);
    return result;
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    // Provide a user-friendly error message in Italian
    return { suggestions: ["Si è verificato un errore nel recuperare i suggerimenti. Riprova più tardi o contatta l'assistenza."] };
  }
}
