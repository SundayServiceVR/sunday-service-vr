import { DocumentSnapshot } from "firebase/firestore";

export function docToRawType<T>(doc:  DocumentSnapshot){
    return {
        id: doc.id,
        ...doc.data()
    } as T;
};