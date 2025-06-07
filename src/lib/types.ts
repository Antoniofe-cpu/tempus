
export interface Watch {
  id: string; // Generato automaticamente (es. da Firestore o UUID)
  name: string;
  brand: string;
  price: number;
  stock: number; 
  imageUrl: string; // URL dell'immagine
  description: string;
  rarity?: string; // Es. "Limited Edition", "Rare Vintage"
  condition?: string; // Es. "New", "Mint", "Pre-owned"
  dataAiHint?: string; // Per la ricerca di immagini AI o placeholder
}

export type WatchType = 'Dress' | 'Sportivo' | 'Cronografo' | 'Subacqueo' | 'Vintage' | 'Altro';

export interface PersonalizedRequest {
  id?: string;
  name: string;
  email: string;
  watchType: WatchType | string; 
  desiredBrand?: string;
  desiredModel?: string;
  budget?: number[]; // Range [min, max]
  aiCriteria?: string;
  additionalNotes?: string;
  status?: 'Nuova' | 'In Lavorazione' | 'Completata' | 'Cancellata';
  createdAt?: Date;
  updatedAt?: Date;
}
