
// src/services/sellRequestService.ts
'use server';

import type { SellRequest, SellRequestFirestoreData, SellRequestStatus } from '@/lib/types';
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
  serverTimestamp
} from 'firebase/firestore';

const SELL_REQUESTS_COLLECTION = 'sellRequests';

const fromFirestore = (docSnap: import('firebase/firestore').DocumentSnapshot): SellRequest => {
  const data = docSnap.data() as SellRequestFirestoreData;
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

export async function getSellRequests(): Promise<SellRequest[]> {
  try {
    const collRef = collection(db, SELL_REQUESTS_COLLECTION);
    const q = query(collRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Errore in getSellRequests (Firestore): ", error);
    throw new Error(`Impossibile caricare le proposte di vendita: ${(error as Error).message}`);
  }
}

export async function getSellRequestById(id: string): Promise<SellRequest | null> {
  try {
    const docRef = doc(db, SELL_REQUESTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return fromFirestore(docSnap);
    }
    return null;
  } catch (error) {
    console.error(`Errore in getSellRequestById (Firestore) per ID ${id}: `, error);
    throw new Error(`Impossibile caricare la proposta di vendita: ${(error as Error).message}`);
  }
}

export async function addSellRequestService(
  requestData: Omit<SellRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'adminNotes' | 'offerAmount'> & { status?: SellRequestStatus }
): Promise<SellRequest> {
  try {
    const dataToSave: Omit<SellRequestFirestoreData, 'id' | 'updatedAt' | 'adminNotes' | 'offerAmount'> = {
      ...requestData,
      watchYear: requestData.watchYear ?? undefined,
      desiredPrice: requestData.desiredPrice ?? undefined,
      status: requestData.status || 'Nuova Proposta',
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, SELL_REQUESTS_COLLECTION), dataToSave);
    const newRequest = await getSellRequestById(docRef.id);
    if (!newRequest) throw new Error("Errore nel recuperare la proposta di vendita appena creata.");
    return newRequest;
  } catch (error) {
    console.error("Errore in addSellRequestService (Firestore): ", error);
    throw new Error(`Impossibile aggiungere la proposta di vendita: ${(error as Error).message}`);
  }
}

export async function updateSellRequestService(
  id: string,
  updateData: Partial<Omit<SellRequest, 'id' | 'createdAt'>>
): Promise<SellRequest | null> {
  try {
    const docRef = doc(db, SELL_REQUESTS_COLLECTION, id);
    
    const dataToUpdate: Partial<SellRequestFirestoreData> = { ...updateData };
    dataToUpdate.updatedAt = serverTimestamp() as Timestamp;

    if (updateData.watchYear === null) dataToUpdate.watchYear = undefined;
    if (updateData.desiredPrice === null) dataToUpdate.desiredPrice = undefined;
    if (updateData.offerAmount === null) dataToUpdate.offerAmount = undefined;
    
    Object.keys(dataToUpdate).forEach(key => {
        const k = key as keyof Partial<SellRequestFirestoreData>;
        if (dataToUpdate[k] === undefined) {
            delete dataToUpdate[k];
        }
    });

    await updateDoc(docRef, dataToUpdate);
    return getSellRequestById(id);
  } catch (error) {
    console.error(`Errore in updateSellRequestService (Firestore) per ID ${id}: `, error);
    throw new Error(`Impossibile aggiornare la proposta di vendita: ${(error as Error).message}`);
  }
}

export async function deleteSellRequestService(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, SELL_REQUESTS_COLLECTION, id));
  } catch (error) {
    console.error(`Errore in deleteSellRequestService (Firestore) per ID ${id}: `, error);
    throw new Error(`Impossibile eliminare la proposta di vendita: ${(error as Error).message}`);
  }
}
