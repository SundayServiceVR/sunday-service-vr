import { doc, getDoc, setDoc } from "firebase/firestore";
import { Club } from "../util/types";
import { db } from "../util/firebase";

const CLUB_SETTINGS_PATH = "club/s4";

export const getClubSettings = async (): Promise<Club> => {
    const docRef = doc(db, CLUB_SETTINGS_PATH);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        return docSnap.data() as Club;
    } else {
        console.warn(`Club settings document at path "${CLUB_SETTINGS_PATH}" does not exist. Returning default empty settings.`);
        // Return default empty settings if document doesn't exist
        return {};
    }
}

export const updateClubSettings = async (settings: Club) => {
    const docRef = doc(db, CLUB_SETTINGS_PATH);
    return await setDoc(docRef, settings, { merge: true });
}
