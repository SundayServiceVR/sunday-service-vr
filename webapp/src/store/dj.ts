import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { Dj } from "../util/types"
import { db } from "../util/firebase";

export const createDj = async (dj: Dj) => {
    return await addDoc(collection(db, "djs"), dj);
}

export const updateDj = async (djId: string, dj: Dj) => {
    const newDoc = doc(db, "djs", djId);
    return await setDoc(newDoc, dj);
}