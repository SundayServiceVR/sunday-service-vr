// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {  getAuth, OAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { addDoc, collection, getDocs, getFirestore, query, where } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
​const auth = getAuth(app);
// ​​const db = getFirestore(app);

const sundayServiceAuthProvder = new OAuthProvider("oidc.sunday-service-vr-discord");

// const signInWithGoogle = async () => {
//   const res = await signInWithPopup(auth, sundayServiceAuthProvder);
//   const user = res.user;
//   const q = query(collection(db, "users"), where("uid", "==", user.uid));
//   const docs = await getDocs(q);
//   if (docs.docs.length === 0) {
//     await addDoc(collection(db, "users"), {
//       uid: user.uid,
//       name: user.displayName,
//       authProvider: "google",
//       email: user.email,
//     });
//   }
// };

// const registerWithEmailAndPassword = async (name: string, email: string, password: string) => {
//   const res = await createUserWithEmailAndPassword(auth, email, password);
//   const user = res.user;
//   await addDoc(collection(db, "users"), {
//     uid: user.uid,
//     name,
//     authProvider: "local",
//     email,
//   });
// };

// const logInWithEmailAndPassword = async (email: string, password: string) => {
//     await signInWithEmailAndPassword(auth, email, password);
// };

// const sendPasswordReset = async (email: string) => {
//   await sendPasswordResetEmail(auth, email);
//   alert("Password reset link sent!");
// };
const logout = () => {
  signOut(auth);
};

export {
  auth,
  // db,
  sundayServiceAuthProvder,
  // signInWithGoogle,
  // logInWithEmailAndPassword,
  // registerWithEmailAndPassword,
  // sendPasswordReset,
  logout,
};