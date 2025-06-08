
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
  isNewArrival?: boolean;
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
  id: string; 
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
  createdAt: Date; 
  updatedAt?: Date; 
}

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

// Tipi per Richieste di Riparazione
export type RepairRequestStatus =
  | 'Nuova'
  | 'In Valutazione'
  | 'Preventivo Inviato'
  | 'Approvata dal Cliente'
  | 'Rifiutata dal Cliente'
  | 'In Riparazione'
  | 'Riparazione Completata'
  | 'In Attesa di Pagamento'
  | 'Pagamento Ricevuto'
  | 'Pronta per Ritiro/Spedizione'
  | 'Conclusa'
  | 'Non Riparabile'
  | 'Cancellata';

export const AllRepairRequestStatuses: RepairRequestStatus[] = [
  'Nuova',
  'In Valutazione',
  'Preventivo Inviato',
  'Approvata dal Cliente',
  'Rifiutata dal Cliente',
  'In Riparazione',
  'Riparazione Completata',
  'In Attesa di Pagamento',
  'Pagamento Ricevuto',
  'Pronta per Ritiro/Spedizione',
  'Conclusa',
  'Non Riparabile',
  'Cancellata',
];

export interface RepairRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  watchBrand: string;
  watchModel: string;
  watchSerialNumber?: string;
  problemDescription: string;
  status: RepairRequestStatus;
  createdAt: Date;
  updatedAt?: Date;
  adminNotes?: string;
  quoteAmount?: number;
  quoteDetails?: string;
  estimatedCompletionDate?: Date | null; // Modificato per permettere null
  actualCompletionDate?: Date | null;   // Modificato per permettere null
}

export interface RepairRequestFirestoreData {
  name: string;
  email: string;
  phone?: string;
  watchBrand: string;
  watchModel: string;
  watchSerialNumber?: string;
  problemDescription: string;
  status: RepairRequestStatus;
  createdAt: import('firebase/firestore').Timestamp;
  updatedAt?: import('firebase/firestore').Timestamp;
  adminNotes?: string;
  quoteAmount?: number;
  quoteDetails?: string;
  estimatedCompletionDate?: import('firebase/firestore').Timestamp | null; // Modificato
  actualCompletionDate?: import('firebase/firestore').Timestamp | null;   // Modificato
}

// Tipi per Proposte di Vendita
export const watchConditionOptions = ['Nuovo', 'Come Nuovo (Mint)', 'Ottime Condizioni', 'Buone Condizioni', 'Discrete Condizioni'] as const;
export type WatchCondition = typeof watchConditionOptions[number];


export type SellRequestStatus =
  | 'Nuova Proposta'
  | 'In Valutazione'
  | 'Offerta Inviata'
  | 'Accettata dal Cliente'
  | 'Rifiutata dal Cliente'
  | 'In Attesa Ricezione Orologio'
  | 'Orologio Ricevuto e Verificato'
  | 'Pagamento Effettuato'
  | 'Conclusa'
  | 'Cancellata'
  | 'In Trattativa';

export const AllSellRequestStatuses: SellRequestStatus[] = [
  'Nuova Proposta',
  'In Valutazione',
  'In Trattativa',
  'Offerta Inviata',
  'Accettata dal Cliente',
  'Rifiutata dal Cliente',
  'In Attesa Ricezione Orologio',
  'Orologio Ricevuto e Verificato',
  'Pagamento Effettuato',
  'Conclusa',
  'Cancellata',
];

export interface SellRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  watchBrand: string;
  watchModel: string;
  watchYear?: number;
  watchCondition: WatchCondition;
  hasBox: boolean;
  hasPapers: boolean;
  desiredPrice?: number;
  additionalInfo?: string;
  // photoUrls?: string[]; // Per ora omesso per semplicità
  status: SellRequestStatus;
  createdAt: Date;
  updatedAt?: Date;
  adminNotes?: string;
  offerAmount?: number; 
}

export interface SellRequestFirestoreData {
  name: string;
  email: string;
  phone?: string;
  watchBrand: string;
  watchModel: string;
  watchYear?: number;
  watchCondition: WatchCondition;
  hasBox: boolean;
  hasPapers: boolean;
  desiredPrice?: number;
  additionalInfo?: string;
  status: SellRequestStatus;
  createdAt: import('firebase/firestore').Timestamp;
  updatedAt?: import('firebase/firestore').Timestamp;
  adminNotes?: string;
  offerAmount?: number;
}


export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  link: string;
}

export interface AppSettings {
  id?: string; // ID del documento Firestore, solitamente uno fisso
  appName: string;
  contactEmail: string;
  defaultCurrency: string;
  // Altri campi possono essere aggiunti qui
  updatedAt?: Date; // Per tracciare l'ultima modifica
}

export interface AppSettingsFirestoreData {
  appName: string;
  contactEmail: string;
  defaultCurrency: string;
  updatedAt?: import('firebase/firestore').Timestamp;
}
