
// src/services/appSettingsService.ts
'use server';

import type { AppSettings, AppSettingsFirestoreData } from '@/lib/types';
import { db } from '@/lib/firebase'; // storage non è più necessario qui
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
// ref, uploadBytes, getDownloadURL da firebase/storage sono stati rimossi perché l'upload avviene nel client

const SETTINGS_COLLECTION = 'appConfiguration';
const SETTINGS_DOC_ID = 'mainSettings';

const defaultSettings: AppSettings = {
  appName: 'Tempus Concierge',
  contactEmail: 'info@tempusconcierge.com',
  defaultCurrency: 'EUR',
  mainServicesIconUrl: '', 
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
      // Qui usiamo i defaultSettings definiti sopra che includono mainServicesIconUrl
      const initialSettingsData: AppSettingsFirestoreData = {
        appName: defaultSettings.appName,
        contactEmail: defaultSettings.contactEmail,
        defaultCurrency: defaultSettings.defaultCurrency,
        mainServicesIconUrl: defaultSettings.mainServicesIconUrl,
        updatedAt: serverTimestamp() as Timestamp,
      };
      await setDoc(docRef, initialSettingsData);
      return { ...defaultSettings, id: SETTINGS_DOC_ID, updatedAt: new Date() }; 
    }
  } catch (error) {
    console.error("Errore in getAppSettings (Firestore): ", error);
    // In caso di errore, restituisci i default, ma logga l'errore
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
    
    if (settingsData.mainServicesIconUrl === undefined) {
      dataToUpdate.mainServicesIconUrl = '';
    }
    
    await setDoc(docRef, dataToUpdate, { merge: true });
  } catch (error) {
    console.error("Errore in updateAppSettings (Firestore): ", error);
    throw new Error(`Impossibile aggiornare le impostazioni: ${(error as Error).message}`);
  }
}

// La funzione uploadAppSettingsIcon è stata rimossa da qui e spostata nel client component.
