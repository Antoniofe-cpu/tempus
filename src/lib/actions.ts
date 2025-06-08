
'use server';

import { z } from 'zod';
import type { PersonalizedRequest, RepairRequestStatus, SellRequestStatus, WatchCondition } from './types';
import { watchConditionOptions } from './types'; // Import watchConditionOptions
import { suggestWatches as genAISuggestWatches, type SuggestWatchesInput, type SuggestWatchesOutput } from '@/ai/flows/suggest-watches';
import { fetchWatchNews as genAIFetchWatchNews, type FetchWatchNewsOutput } from '@/ai/flows/fetch-watch-news-flow';
import { addRequestService } from '@/services/requestService';
import { addRepairRequestService } from '@/services/repairRequestService';
import { addSellRequestService } from '@/services/sellRequestService'; // Importato il nuovo servizio

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
  requestId?: string; 
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
    budgetMin: parsed.data.budgetMin ?? undefined, 
    budgetMax: parsed.data.budgetMax ?? undefined, 
    aiCriteria: parsed.data.aiCriteria,
    additionalNotes: parsed.data.additionalNotes,
    status: 'Nuova' as const, 
  };

  try {
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
    return { suggestions: ["Si è verificato un errore nel recuperare i suggerimenti. Riprova più tardi o contatta l'assistenza."] };
  }
}

export async function getWatchNews(): Promise<FetchWatchNewsOutput> {
  try {
    const result = await genAIFetchWatchNews();
    return result && result.newsItems ? result : { newsItems: [] };
  } catch (error) {
    console.error("Error getting AI watch news:", error);
    return { 
      newsItems: [{ 
        title: "Errore di Caricamento Notizie", 
        summary: "Impossibile caricare le notizie dal mondo degli orologi in questo momento. Riprova più tardi." 
      }] 
    };
  }
}

const RepairRequestSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  phone: z.string().optional().refine(val => !val || /^[+]?[0-9\s-()]*$/.test(val), { message: "Numero di telefono non valido."}),
  watchBrand: z.string().min(1, { message: "La marca dell'orologio è obbligatoria." }),
  watchModel: z.string().min(1, { message: "Il modello dell'orologio è obbligatorio." }),
  watchSerialNumber: z.string().optional(),
  problemDescription: z.string().min(10, { message: "Descrivi il problema in almeno 10 caratteri." }),
});

export async function submitRepairRequest(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  const parsed = RepairRequestSchema.safeParse(formData);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => {
      return issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message;
    });
    console.error('Validation errors (Repair Request):', parsed.error.flatten());
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
    phone: parsed.data.phone,
    watchBrand: parsed.data.watchBrand,
    watchModel: parsed.data.watchModel,
    watchSerialNumber: parsed.data.watchSerialNumber,
    problemDescription: parsed.data.problemDescription,
    status: 'Nuova' as RepairRequestStatus,
  };

  try {
    const newRequest = await addRepairRequestService(requestDataToSave);
    return { 
      message: `Grazie ${parsed.data.name}, la tua richiesta di riparazione (ID: ${newRequest.id}) è stata inviata! Ti contatteremo al più presto.`, 
      success: true,
      requestId: newRequest.id
    };
  } catch (error) {
    console.error('Errore nel salvataggio della richiesta di riparazione:', error);
    return {
      message: `Si è verificato un errore durante l'invio della richiesta di riparazione: ${(error as Error).message}. Riprova più tardi.`,
      fields: formData as Record<string, string>,
      success: false,
    };
  }
}

// Schema e Action per Proposta di Vendita
const currentYear = new Date().getFullYear();
const SellRequestSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  phone: z.string().optional().refine(val => !val || /^[+]?[0-9\s-()]*$/.test(val), { message: "Numero di telefono non valido."}),
  watchBrand: z.string().min(1, { message: "La marca è obbligatoria." }),
  watchModel: z.string().min(1, { message: "Il modello è obbligatorio." }),
  watchYear: z.coerce.number().int().min(1900, {message: "Anno non valido."}).max(currentYear, {message: `L'anno non può superare ${currentYear}.`}).optional().nullable(),
  watchCondition: z.enum(watchConditionOptions, { errorMap: () => ({ message: 'Seleziona una condizione valida.' })}),
  hasBox: z.preprocess(val => val === 'on' || val === true, z.boolean()).default(false),
  hasPapers: z.preprocess(val => val === 'on' || val === true, z.boolean()).default(false),
  desiredPrice: z.coerce.number().min(0, {message: "Il prezzo deve essere positivo."}).optional().nullable(),
  additionalInfo: z.string().max(1000, {message: "Le informazioni non possono superare 1000 caratteri."}).optional(),
});


export async function submitSellRequest(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  const parsed = SellRequestSchema.safeParse(formData);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => {
      return issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message;
    });
    console.error('Validation errors (Sell Request):', parsed.error.flatten().fieldErrors);
    return {
      message: "Errore nella validazione dei dati. Controlla i campi e i messaggi qui sotto.",
      fields: formData as Record<string, string>, // Restituisce i dati del form per precompilazione
      issues,
      success: false,
    };
  }

  const requestDataToSave = {
    ...parsed.data,
    status: 'Nuova Proposta' as SellRequestStatus,
  };

  try {
    const newRequest = await addSellRequestService(requestDataToSave);
    return { 
      message: `Grazie ${parsed.data.name}, la tua proposta di vendita (ID: ${newRequest.id}) è stata inviata! Ti contatteremo al più presto per una valutazione.`, 
      success: true,
      requestId: newRequest.id
    };
  } catch (error) {
    console.error('Errore nel salvataggio della proposta di vendita:', error);
    return {
      message: `Si è verificato un errore durante l'invio della proposta: ${(error as Error).message}. Riprova più tardi.`,
      fields: formData as Record<string, string>,
      success: false,
    };
  }
}
