
'use server';

import { z } from 'zod';
import type { PersonalizedRequest } from './types';
import { suggestWatches as genAISuggestWatches, type SuggestWatchesInput, type SuggestWatchesOutput } from '@/ai/flows/suggest-watches';
import { addRequestService } from '@/services/requestService'; // Importa il servizio corretto

// Schema for personalized request form validation
const PersonalizedRequestSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  watchType: z.string().min(1, { message: "Seleziona un tipo di orologio." }),
  desiredBrand: z.string().optional(),
  desiredModel: z.string().optional(),
  budgetMin: z.coerce.number().min(0).optional().nullable(),
  budgetMax: z.coerce.number().min(0).optional().nullable(),
  aiCriteria: z.string().max(500, {message: "La descrizione per AI non può superare i 500 caratteri."}).optional(),
  additionalNotes: z.string().max(1000, {message: "Le note aggiuntive non possono superare i 1000 caratteri."}).optional(),
}).refine(data => {
  if (data.budgetMin !== null && data.budgetMin !== undefined && 
      data.budgetMax !== null && data.budgetMax !== undefined) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: "Il budget massimo deve essere maggiore o uguale al budget minimo.",
  path: ["budgetMax"],
});


export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  success: boolean;
  requestId?: string; // Aggiunto per poter passare l'ID della richiesta creata
};

export async function submitPersonalizedRequest(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  const parsed = PersonalizedRequestSchema.safeParse(formData);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => {
      return issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message;
    });
    console.error('Validation errors:', parsed.error.flatten());
    return {
      message: "Errore nella validazione dei dati. Controlla i campi e i messaggi qui sotto.",
      fields: formData as Record<string, string>,
      issues,
      success: false,
    };
  }

  const requestDataToSave = {
    name: parsed.data.name,
    email: parsed.data.email,
    watchType: parsed.data.watchType,
    desiredBrand: parsed.data.desiredBrand,
    desiredModel: parsed.data.desiredModel,
    budgetMin: parsed.data.budgetMin ?? undefined, // Converti null in undefined se necessario per il servizio
    budgetMax: parsed.data.budgetMax ?? undefined, // Converti null in undefined se necessario per il servizio
    aiCriteria: parsed.data.aiCriteria,
    additionalNotes: parsed.data.additionalNotes,
    status: 'Nuova' as const, // Assicurati che lo status sia del tipo corretto
  };

  try {
    // Salva la richiesta usando il servizio, che gestisce i Timestamp
    const newRequest = await addRequestService(requestDataToSave);
    return { 
      message: `Grazie ${parsed.data.name}, la tua richiesta è stata inviata con successo! ID Richiesta: ${newRequest.id}. Ti contatteremo presto.`, 
      success: true,
      requestId: newRequest.id
    };
  } catch (error) {
    console.error('Errore nel salvataggio della richiesta:', error);
    return {
      message: `Si è verificato un errore durante l'invio della richiesta: ${(error as Error).message}. Riprova più tardi.`,
      fields: formData as Record<string, string>,
      success: false,
    };
  }
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
