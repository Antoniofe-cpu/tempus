

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

  // Nuovi campi per caratteristiche dettagliate
  referenceNumber?: string;
  caseMaterial?: string;
  caseDiameter?: string; // es. "40mm"
  caseThickness?: string; // es. "12mm"
  waterResistance?: string; // es. "100m"
  movementType?: string; // es. "Automatico", "Manuale", "Quarzo"
  caliber?: string;
  powerReserve?: string; // es. "70 ore"
  dialColor?: string;
  dialMarkers?: string; // es. "Indici a bastone", "Numeri Arabi"
  braceletMaterial?: string;
  claspType?: string;
  functions?: string[]; // Array di stringhe per le funzioni, es. ["Cronografo", "Data"]
  additionalImageUrls?: string[]; // Array di URL per immagini aggiuntive
  yearOfProduction?: number; // Anno di produzione
  complications?: string[]; // Es. ["Datario", "Fasi Lunari"]
  crystalType?: string; // Es. "Zaffiro"
  lugWidth?: string; // Es. "20mm"
  bezelMaterial?: string;
}

export interface WatchFirestoreData {
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
  referenceNumber?: string;
  caseMaterial?: string;
  caseDiameter?: string;
  caseThickness?: string;
  waterResistance?: string;
  movementType?: string;
  caliber?: string;
  powerReserve?: string;
  dialColor?: string;
  dialMarkers?: string;
  braceletMaterial?: string;
  claspType?: string;
  functions?: string[];
  additionalImageUrls?: string[];
  yearOfProduction?: number;
  complications?: string[];
  crystalType?: string;
  lugWidth?: string;
  bezelMaterial?: string;
  // Eventuali campi timestamp gestiti da Firestore
  createdAt?: import('firebase/firestore').Timestamp;
  updatedAt?: import('firebase/firestore').Timestamp;
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
  estimatedCompletionDate?: Date | null;
  actualCompletionDate?: Date | null;
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
  estimatedCompletionDate?: import('firebase/firestore').Timestamp | null;
  actualCompletionDate?: import('firebase/firestore').Timestamp | null;
}

// Tipi per Proposte di Vendita
export const watchConditionOptions = ['Nuovo', 'Come Nuovo (Mint)', 'Ottime Condizioni', 'Buone Condizioni', 'Discrete Condizioni'] as const;
export type WatchCondition = typeof watchConditionOptions[number];


export type SellRequestStatus =
  | 'Nuova Proposta'
  | 'In Valutazione'
  | 'In Trattativa'
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
  id?: string;
  appName: string;
  contactEmail: string;
  defaultCurrency: string;
  mainServicesIconUrl?: string; // Nuovo campo per l'icona principale dei servizi
  updatedAt?: Date;
}

export interface AppSettingsFirestoreData {
  appName: string;
  contactEmail: string;
  defaultCurrency: string;
  mainServicesIconUrl?: string; // Nuovo campo per l'icona principale dei servizi
  updatedAt?: import('firebase/firestore').Timestamp;
}
