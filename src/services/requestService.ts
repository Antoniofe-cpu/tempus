
// src/services/requestService.ts
'use server';

import type { PersonalizedRequest, PersonalizedRequestFirestoreData, RequestStatus } from '@/lib/types';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp,
  orderBy,
  query,
  where, // Aggiunto where
  serverTimestamp
} from 'firebase/firestore';

const REQUESTS_COLLECTION = 'requests';

// Helper per convertire i dati da Firestore (con Timestamp) a PersonalizedRequest (con Date)
const fromFirestore = (docSnap: import('firebase/firestore').DocumentSnapshot): PersonalizedRequest => {
  const data = docSnap.data() as PersonalizedRequestFirestoreData;
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

export async function getRequests(): Promise<PersonalizedRequest[]> {
  try {
    const requestsCollection = collection(db, REQUESTS_COLLECTION);
    const q = query(requestsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Errore in getRequests (Firestore): ", error);
    throw new Error(`Impossibile caricare le richieste: ${(error as Error).message}`);
  }
}

export async function getRequestsByEmail(email: string): Promise<PersonalizedRequest[]> {
  if (!email) {
    return [];
  }
  try {
    const requestsCollection = collection(db, REQUESTS_COLLECTION);
    const q = query(
      requestsCollection, 
      where("email", "==", email), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error(`Errore in getRequestsByEmail (Firestore) per email ${email}: `, error);
    throw new Error(`Impossibile caricare le richieste per l'utente: ${(error as Error).message}`);
  }
}


export async function getRequestById(id: string): Promise<PersonalizedRequest | null> {
  try {
    const requestDocRef = doc(db, REQUESTS_COLLECTION, id);
    const docSnap = await getDoc(requestDocRef);
    if (docSnap.exists()) {
      return fromFirestore(docSnap);
    }
    return null;
  } catch (error) {
    console.error(`Errore in getRequestById (Firestore) per ID ${id}: `, error);
    throw new Error(`Impossibile caricare la richiesta: ${(error as Error).message}`);
  }
}

export async function addRequestService(
  requestData: Omit<PersonalizedRequest, 'id' | 'createdAt' | 'updatedAt'> & { status: RequestStatus }
): Promise<PersonalizedRequest> {
  try {
    // Includi userId se disponibile e se vuoi salvarlo
    // const user = auth.currentUser; // Se questa action fosse un client component con accesso a `auth`
    // const userId = user ? user.uid : undefined; 
    // const dataToSave: Omit<PersonalizedRequestFirestoreData, 'id' | 'updatedAt'> = {
    //   ...requestData,
    //   userId, // Aggiungi userId qui se vuoi salvarlo
    //   budgetMin: requestData.budgetMin ?? undefined,
    //   budgetMax: requestData.budgetMax ?? undefined,
    //   createdAt: Timestamp.now(),
    // };

    const dataToSave: Omit<PersonalizedRequestFirestoreData, 'id' | 'updatedAt'> = {
      ...requestData,
      budgetMin: requestData.budgetMin ?? undefined,
      budgetMax: requestData.budgetMax ?? undefined,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), dataToSave);
    const newRequest = await getRequestById(docRef.id);
    if (!newRequest) throw new Error("Errore nel recuperare la richiesta appena creata.");
    return newRequest;
  } catch (error) {
    console.error("Errore in addRequestService (Firestore): ", error);
    throw new Error(`Impossibile aggiungere la richiesta: ${(error as Error).message}`);
  }
}

export async function updateRequestService(
  id: string,
  requestUpdateData: Partial<Omit<PersonalizedRequest, 'id' | 'createdAt'>>
): Promise<PersonalizedRequest | null> {
  try {
    const requestRef = doc(db, REQUESTS_COLLECTION, id);
    const dataToUpdate: Partial<PersonalizedRequestFirestoreData> = {
      ...requestUpdateData,
      updatedAt: serverTimestamp() as Timestamp, 
    };
    if (requestUpdateData.budgetMin === null) dataToUpdate.budgetMin = undefined;
    if (requestUpdateData.budgetMax === null) dataToUpdate.budgetMax = undefined;


    await updateDoc(requestRef, dataToUpdate);
    const updatedRequest = await getRequestById(id);
    return updatedRequest;
  } catch (error) {
    console.error(`Errore in updateRequestService (Firestore) per ID ${id}: `, error);
    throw new Error(`Impossibile aggiornare la richiesta: ${(error as Error).message}`);
  }
}

export async function deleteRequestService(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, REQUESTS_COLLECTION, id));
  } catch (error) {
    console.error(`Errore in deleteRequestService (Firestore) per ID ${id}: `, error);
    throw new Error(`Impossibile eliminare la richiesta: ${(error as Error).message}`);
  }
}

