
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLiHWGv608qbGNVOoGpWog9hljNpCFsNw",
  authDomain: "sunday-service-vr.firebaseapp.com",
  // authDomain: "localhost:3000",
  projectId: "sunday-service-vr",
  storageBucket: "sunday-service-vr.appspot.com",
  messagingSenderId: "610955197411",
  appId: "1:610955197411:web:176a1ec89d1be7d9417ed6",
  measurementId: "G-ESYWL7W398",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const authProviderId = "oidc.sunday-service-vr-discord";

// https://sunday-service-vr.firebaseapp.com/__/auth/handler?apiKey=AIzaSyDLiHWGv608qbGNVOoGpWog9hljNpCFsNw&appName=%5BDEFAULT%5D&authType=signInViaRedirect&redirectUrl=http%3A%2F%2Flocalhost%3A3000%2Fsunday-service-vr&v=10.11.0&providerId=oidc.sunday-service-vr-discord