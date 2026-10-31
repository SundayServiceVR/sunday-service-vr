import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInWithCustomToken } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { emulatorHost, emulatorPorts, isEmulator, projectId } from "./config";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLiHWGv608qbGNVOoGpWog9hljNpCFsNw", // This is not a secret
  authDomain: "sunday-service-vr.firebaseapp.com",
  projectId,
  storageBucket: "sunday-service-vr.firebasestorage.app",
  messagingSenderId: "610955197411",
  appId: "1:610955197411:web:176a1ec89d1be7d9417ed6",
  measurementId: "G-ESYWL7W398",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

// Firebase Storage for hosting media like lineup poster images
export const storage = getStorage(app);

if (isEmulator) {
  connectFirestoreEmulator(db, emulatorHost, emulatorPorts.firestore);
  connectStorageEmulator(storage, emulatorHost, emulatorPorts.storage);
  connectAuthEmulator(auth, `http://${emulatorHost}:${emulatorPorts.auth}`, { disableWarnings: true });

  // Test hook (emulator only): lets automated tests sign in with a custom token minted by the Admin SDK.
  (window as unknown as { __signInWithCustomToken: (token: string) => Promise<unknown> }).__signInWithCustomToken =
    (token: string) => signInWithCustomToken(auth, token);
}
