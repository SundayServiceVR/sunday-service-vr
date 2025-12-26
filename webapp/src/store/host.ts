import { addDoc, collection, doc, setDoc, deleteDoc, getDocs, orderBy, query } from "firebase/firestore";
import { Host } from "../util/types"
import { db } from "../util/firebase";
import { docToHost } from "./converters";

export const createHost = async (host: Host) => {
    return await addDoc(collection(db, "hosts"), host);
}

export const updateHost = async (hostId: string, host: Host) => {
    const newDoc = doc(db, "hosts", hostId);
    return await setDoc(newDoc, host);
}

export const deleteHost = async (hostId: string) => {
    const hostDoc = doc(db, "hosts", hostId);
    return await deleteDoc(hostDoc);
}

export const getAllHosts = async () => {
    const q = query(collection(db, "hosts"), orderBy("host_name", "asc"));
    const querySnapshot = await getDocs(q);
    
    const hosts: Host[] = querySnapshot.docs
        .map((doc) => docToHost(doc))
        .sort((a, b) => a.host_name.localeCompare(b.host_name));

    return hosts;
}
