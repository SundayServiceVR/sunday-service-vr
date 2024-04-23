
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLiHWGv608qbGNVOoGpWog9hljNpCFsNw",
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