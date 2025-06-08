
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
const SETTINGS_DOC_ID = 'mainSettings';

const defaultSettings: AppSettings = {
  appName: 'Tempus Concierge',
  contactEmail: 'info@tempusconcierge.com',
  defaultCurrency: 'EUR',
  iconUrlCompra: '',
  iconUrlVendi: '',
  iconUrlCerca: '',
  iconUrlRipara: '',
};

const fromFirestore = (data: AppSettingsFirestoreData, id: string): AppSettings => {
  return {
    id,
    appName: data.appName,
    contactEmail: data.contactEmail,
    defaultCurrency: data.defaultCurrency,
    iconUrlCompra: data.iconUrlCompra || '',
    iconUrlVendi: data.iconUrlVendi || '',
    iconUrlCerca: data.iconUrlCerca || '',
    iconUrlRipara: data.iconUrlRipara || '',
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
      console.log(`Documento impostazioni ${SETTINGS_DOC_ID} non trovato. Inizializzazione con valori di default.`);
      const initialSettingsData: AppSettingsFirestoreData = {
        ...defaultSettings, // i default ora includono i nuovi campi iconUrl
        updatedAt: serverTimestamp() as Timestamp,
      };
      // Rimuovi 'id' dai dati iniziali se presente in defaultSettings (non dovrebbe esserci)
      delete (initialSettingsData as any).id; 
      await setDoc(docRef, initialSettingsData);
      return { ...defaultSettings, id: SETTINGS_DOC_ID, updatedAt: new Date() }; 
    }
  } catch (error) {
    console.error("Errore in getAppSettings (Firestore): ", error);
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
    
    // Assicura che gli URL delle icone siano stringhe vuote se non definiti, per evitare 'undefined' in Firestore
    if (settingsData.iconUrlCompra === undefined) dataToUpdate.iconUrlCompra = '';
    if (settingsData.iconUrlVendi === undefined) dataToUpdate.iconUrlVendi = '';
    if (settingsData.iconUrlCerca === undefined) dataToUpdate.iconUrlCerca = '';
    if (settingsData.iconUrlRipara === undefined) dataToUpdate.iconUrlRipara = '';
    
    await setDoc(docRef, dataToUpdate, { merge: true });
  } catch (error) {
    console.error("Errore in updateAppSettings (Firestore): ", error);
    throw new Error(`Impossibile aggiornare le impostazioni: ${(error as Error).message}`);
  }
}

    