import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { Dj } from "../util/types"
import { db } from "../util/firebase";

const augmentDjData = (dj: Dj) => {
    dj.sort_name = dj.dj_name?.toLocaleLowerCase();
    return dj;
}

export const createDj = async (dj: Dj) => {
    return await addDoc(collection(db, "djs"), augmentDjData(dj));
}

export const saveDj = async (dj: Dj) => {
    return await addDoc(collection(db, "djs"), augmentDjData(dj));
}

export const updateDj = async (djId: string, dj: Dj) => {
    const newDoc = doc(db, "djs", djId);
    return await setDoc(newDoc, augmentDjData(dj));
}