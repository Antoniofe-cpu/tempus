
// src/services/appSettingsService.ts
'use server';

import type { AppSettings, AppSettingsFirestoreData } from '@/lib/types';
import { db, storage } from '@/lib/firebase'; // Import storage
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import per storage

const SETTINGS_COLLECTION = 'appConfiguration';
const SETTINGS_DOC_ID = 'mainSettings';

const defaultSettings: AppSettings = {
  appName: 'Tempus Concierge',
  contactEmail: 'info@tempusconcierge.com',
  defaultCurrency: 'EUR',
  mainServicesIconUrl: '', // Default vuoto
};

const fromFirestore = (data: AppSettingsFirestoreData, id: string): AppSettings => {
  return {
    id,
    ...data,
    mainServicesIconUrl: data.mainServicesIconUrl || '',
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
      await setDoc(docRef, { ...defaultSettings, updatedAt: serverTimestamp() });
      return { ...defaultSettings, id: SETTINGS_DOC_ID }; 
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
    // Assicura che mainServicesIconUrl sia una stringa, anche vuota, se non definito
    if (settingsData.mainServicesIconUrl === undefined) {
      dataToUpdate.mainServicesIconUrl = '';
    }
    
    await setDoc(docRef, dataToUpdate, { merge: true });
  } catch (error) {
    console.error("Errore in updateAppSettings (Firestore): ", error);
    throw new Error(`Impossibile aggiornare le impostazioni: ${(error as Error).message}`);
  }
}

// Funzione per caricare l'icona delle impostazioni su Firebase Storage
export async function uploadAppSettingsIcon(file: File, iconName: string = 'mainServicesIcon'): Promise<string> {
  try {
    const fileName = `app-settings-icons/${iconName}-${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading app settings icon to Firebase Storage:", error);
    throw new Error(`Impossibile caricare l'icona: ${(error as Error).message}`);
  }
}
