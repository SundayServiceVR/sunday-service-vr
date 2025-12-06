
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLiHWGv608qbGNVOoGpWog9hljNpCFsNw", // This is not a secret
  authDomain: "sunday-service-vr.firebaseapp.com",
  projectId: "sunday-service-vr",
  storageBucket: "sunday-service-vr.appspot.com",
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

// Use the Storage emulator when running locally
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  connectStorageEmulator(storage, "localhost", 9199);
}
