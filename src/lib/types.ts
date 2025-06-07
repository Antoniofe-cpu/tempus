export interface Watch {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  description: string;
  rarity?: string; // e.g., "Limited Edition", "Rare Vintage"
  condition?: string; // e.g., "New", "Mint", "Pre-owned"
  dataAiHint?: string; // For placeholder image search
}

export type WatchType = 'Dress' | 'Sportivo' | 'Cronografo' | 'Subacqueo' | 'Vintage' | 'Altro';

export interface PersonalizedRequest {
  id?: string;
  name: string;
  email: string;
  watchType: WatchType | string; // Allow 'Altro' to be custom string
  desiredBrand?: string;
  desiredModel?: string;
  budget?: number[]; // Range, e.g., [min, max]
  aiCriteria?: string;
  additionalNotes?: string;
  status?: 'Nuova' | 'In Lavorazione' | 'Completata' | 'Cancellata';
  createdAt?: Date;
  updatedAt?: Date;
}
