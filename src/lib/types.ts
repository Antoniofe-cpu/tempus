
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
  isNewArrival?: boolean; // Aggiunto per coerenza con admin/orologi
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
  // photoUrls?: string[]; // Per ora omesso per semplicità, si può aggiungere input testuale
  status: RepairRequestStatus;
  createdAt: Date;
  updatedAt?: Date;
  adminNotes?: string;
  quoteAmount?: number;
  quoteDetails?: string;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
}

export interface RepairRequestFirestoreData {
  name: string;
  email: string;
  phone?: string;
  watchBrand: string;
  watchModel: string;
  watchSerialNumber?: string;
  problemDescription: string;
  // photoUrls?: string[];
  status: RepairRequestStatus;
  createdAt: import('firebase/firestore').Timestamp;
  updatedAt?: import('firebase/firestore').Timestamp;
  adminNotes?: string;
  quoteAmount?: number;
  quoteDetails?: string;
  estimatedCompletionDate?: import('firebase/firestore').Timestamp;
  actualCompletionDate?: import('firebase/firestore').Timestamp;
}

// Tipi per Proposte di Vendita (Placeholder per ora)
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
  | 'Cancellata';

export const AllSellRequestStatuses: SellRequestStatus[] = [
  'Nuova Proposta',
  'In Valutazione',
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
  watchCondition: string; // Es. Nuovo, Usato Mint, Buono, Discreto
  hasBox: boolean;
  hasPapers: boolean;
  desiredPrice?: number;
  additionalInfo?: string;
  // photoUrls?: string[]; // Per ora omesso
  status: SellRequestStatus;
  createdAt: Date;
  updatedAt?: Date;
  adminNotes?: string;
  offerAmount?: number; // Offerta fatta da Tempus Concierge
}

export interface SellRequestFirestoreData {
  // Simile a SellRequest ma con Timestamp per le date
  name: string;
  email: string;
  phone?: string;
  watchBrand: string;
  watchModel: string;
  watchYear?: number;
  watchCondition: string;
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
