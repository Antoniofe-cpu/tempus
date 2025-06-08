
// src/services/appSettingsService.ts
'use server';

import type { AppSettings, AppSettingsFirestoreData } from '@/lib/types';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

const SETTINGS_COLLECTION = 'appConfiguration';
const SETTINGS_DOC_ID = 'mainSettings'; // ID fisso per il documento delle impostazioni

const defaultSettings: AppSettings = {
  appName: 'Tempus Concierge',
  contactEmail: 'info@tempusconcierge.com',
  defaultCurrency: 'EUR',
};

// Helper per convertire i dati da Firestore (con Timestamp) a AppSettings (con Date)
const fromFirestore = (data: AppSettingsFirestoreData, id: string): AppSettings => {
  return {
    id,
    ...data,
    updatedAt: data.updatedAt?.toDate(),
  };
};

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return fromFirestore(docSnap.data() as AppSettingsFirestoreData, docSnap.id);
    } else {
      // Se il documento non esiste, inizializzalo con i valori di default
      console.log(`Documento impostazioni ${SETTINGS_DOC_ID} non trovato. Inizializzazione con valori di default.`);
      await setDoc(docRef, { ...defaultSettings, updatedAt: serverTimestamp() });
      // Ritorna i default settings (senza id e updatedAt qui, verranno dal prossimo get se necessario)
      return { ...defaultSettings, id: SETTINGS_DOC_ID }; 
    }
  } catch (error) {
    console.error("Errore in getAppSettings (Firestore): ", error);
    // In caso di errore, ritorna i default settings per evitare crash dell'app
    return { ...defaultSettings, id: SETTINGS_DOC_ID };
  }
}

export async function updateAppSettings(settingsData: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const dataToUpdate: Partial<AppSettingsFirestoreData> = {
      ...settingsData,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await setDoc(docRef, dataToUpdate, { merge: true }); // Usa merge:true per aggiornare o creare se non esiste
  } catch (error) {
    console.error("Errore in updateAppSettings (Firestore): ", error);
    throw new Error(`Impossibile aggiornare le impostazioni: ${(error as Error).message}`);
  }
}
