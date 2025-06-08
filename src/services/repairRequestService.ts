
// src/services/repairRequestService.ts
'use server';

import type { RepairRequest, RepairRequestFirestoreData, RepairRequestStatus } from '@/lib/types';
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
  // where, // Non usato per ora, si può aggiungere per filtri specifici
  serverTimestamp
} from 'firebase/firestore';

const REPAIRS_COLLECTION = 'repairRequests';

// Helper per convertire i dati da Firestore (con Timestamp) a RepairRequest (con Date)
const fromFirestore = (docSnap: import('firebase/firestore').DocumentSnapshot): RepairRequest => {
  const data = docSnap.data() as RepairRequestFirestoreData;
  return {
    id: docSnap.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    watchBrand: data.watchBrand,
    watchModel: data.watchModel,
    watchSerialNumber: data.watchSerialNumber,
    problemDescription: data.problemDescription,
    status: data.status,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    adminNotes: data.adminNotes,
    quoteAmount: data.quoteAmount,
    quoteDetails: data.quoteDetails,
    estimatedCompletionDate: data.estimatedCompletionDate?.toDate(),
    actualCompletionDate: data.actualCompletionDate?.toDate(),
  };
};

export async function getRepairRequests(): Promise<RepairRequest[]> {
  try {
    const collRef = collection(db, REPAIRS_COLLECTION);
    const q = query(collRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Errore in getRepairRequests (Firestore): ", error);
    throw new Error(`Impossibile caricare le richieste di riparazione: ${(error as Error).message}`);
  }
}

export async function getRepairRequestById(id: string): Promise<RepairRequest | null> {
  try {
    const docRef = doc(db, REPAIRS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return fromFirestore(docSnap);
    }
    return null;
  } catch (error) {
    console.error(`Errore in getRepairRequestById (Firestore) per ID ${id}: `, error);
    throw new Error(`Impossibile caricare la richiesta di riparazione: ${(error as Error).message}`);
  }
}

export async function addRepairRequestService(
  requestData: Omit<RepairRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'adminNotes' | 'quoteAmount' | 'quoteDetails' | 'estimatedCompletionDate' | 'actualCompletionDate'> & { status?: RepairRequestStatus }
): Promise<RepairRequest> {
  try {
    const dataToSave: Omit<RepairRequestFirestoreData, 'id' | 'updatedAt' | 'adminNotes' | 'quoteAmount' | 'quoteDetails' | 'estimatedCompletionDate' | 'actualCompletionDate'> = {
      name: requestData.name,
      email: requestData.email,
      phone: requestData.phone,
      watchBrand: requestData.watchBrand,
      watchModel: requestData.watchModel,
      watchSerialNumber: requestData.watchSerialNumber,
      problemDescription: requestData.problemDescription,
      status: requestData.status || 'Nuova',
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, REPAIRS_COLLECTION), dataToSave);
    const newRequest = await getRepairRequestById(docRef.id);
    if (!newRequest) throw new Error("Errore nel recuperare la richiesta di riparazione appena creata.");
    return newRequest;
  } catch (error) {
    console.error("Errore in addRepairRequestService (Firestore): ", error);
    throw new Error(`Impossibile aggiungere la richiesta di riparazione: ${(error as Error).message}`);
  }
}

export async function updateRepairRequestService(
  id: string,
  updateData: Partial<Omit<RepairRequest, 'id' | 'createdAt'>>
): Promise<RepairRequest | null> {
  try {
    const docRef = doc(db, REPAIRS_COLLECTION, id);
    
    // Prepara i dati per l'aggiornamento, gestendo le date
    const dataToUpdate: Partial<RepairRequestFirestoreData> = { ...updateData };
    dataToUpdate.updatedAt = serverTimestamp() as Timestamp;

    if (updateData.estimatedCompletionDate) {
      dataToUpdate.estimatedCompletionDate = Timestamp.fromDate(new Date(updateData.estimatedCompletionDate));
    } else if (updateData.hasOwnProperty('estimatedCompletionDate') && updateData.estimatedCompletionDate === null) {
      // Permetti di nullificare la data se necessario
      dataToUpdate.estimatedCompletionDate = undefined; // O `delete dataToUpdate.estimatedCompletionDate;` se vuoi rimuovere il campo
    }

    if (updateData.actualCompletionDate) {
      dataToUpdate.actualCompletionDate = Timestamp.fromDate(new Date(updateData.actualCompletionDate));
    } else if (updateData.hasOwnProperty('actualCompletionDate') && updateData.actualCompletionDate === null) {
      dataToUpdate.actualCompletionDate = undefined;
    }
    
    // Rimuovi undefined per evitare problemi con Firestore
    Object.keys(dataToUpdate).forEach(key => {
        const k = key as keyof Partial<RepairRequestFirestoreData>;
        if (dataToUpdate[k] === undefined) {
            delete dataToUpdate[k];
        }
    });

    await updateDoc(docRef, dataToUpdate);
    return getRepairRequestById(id);
  } catch (error) {
    console.error(`Errore in updateRepairRequestService (Firestore) per ID ${id}: `, error);
    throw new Error(`Impossibile aggiornare la richiesta di riparazione: ${(error as Error).message}`);
  }
}

export async function deleteRepairRequestService(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, REPAIRS_COLLECTION, id));
  } catch (error) {
    console.error(`Errore in deleteRepairRequestService (Firestore) per ID ${id}: `, error);
    throw new Error(`Impossibile eliminare la richiesta di riparazione: ${(error as Error).message}`);
  }
}
