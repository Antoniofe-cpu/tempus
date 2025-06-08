
export interface Watch {
  id: string; 
  name: string;
  brand: string;
  price: number;
  stock: number; 
  imageUrl: string; 
  description: string;
  rarity?: string; 
  condition?: string; 
  dataAiHint?: string; 
}

export type WatchType = 'Dress' | 'Sportivo' | 'Cronografo' | 'Subacqueo' | 'Vintage' | 'Altro';

export type RequestStatus = 
  | 'Nuova' 
  | 'In Valutazione' 
  | 'In Lavorazione' 
  | 'In Attesa Risposta Cliente' 
  | 'In Attesa di Pagamento' 
  | 'Completata' 
  | 'Cancellata' 
  | 'Archiviata';

export const AllRequestStatuses: RequestStatus[] = [
  'Nuova', 
  'In Valutazione', 
  'In Lavorazione', 
  'In Attesa Risposta Cliente', 
  'In Attesa di Pagamento', 
  'Completata', 
  'Cancellata', 
  'Archiviata'
];

export interface PersonalizedRequest {
  id: string; // Firestore ID, non opzionale quando recuperato
  name: string;
  email: string;
  watchType: WatchType | string; 
  desiredBrand?: string;
  desiredModel?: string;
  budgetMin?: number; 
  budgetMax?: number;
  aiCriteria?: string;
  additionalNotes?: string;
  status: RequestStatus; // Non opzionale, default a 'Nuova'
  createdAt: Date; // Firestore Timestamp convertito a Date
  updatedAt?: Date; // Firestore Timestamp convertito a Date
}

// Tipo per i dati inviati a Firestore (usa Timestamp)
export interface PersonalizedRequestFirestoreData {
  name: string;
  email: string;
  watchType: WatchType | string; 
  desiredBrand?: string;
  desiredModel?: string;
  budgetMin?: number; 
  budgetMax?: number;
  aiCriteria?: string;
  additionalNotes?: string;
  status: RequestStatus;
  createdAt: import('firebase/firestore').Timestamp;
  updatedAt?: import('firebase/firestore').Timestamp;
}
