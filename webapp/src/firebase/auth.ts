import {  getAuth, OAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { addDoc, collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { app, authProviderId } from "./config";

const auth = getAuth(app);
// const db = getFirestore(app);

const sundayServiceAuthProvder = new OAuthProvider(authProviderId);

const signInWithDiscord = async () => {
    let currentUser = null;
    auth.onAuthStateChanged(user => currentUser = user);

    
    const redirectResult = await getRedirectResult(auth);
    debugger;

    if (!redirectResult && !currentUser) { signInWithRedirect(auth, sundayServiceAuthProvder); }

    // const user = res.user;

    // const q = query(collection(db, "users"), where("uid", "==", user.uid));
    // const docs = await getDocs(q);
    // if (docs.docs.length === 0) {
    //     await addDoc(collection(db, "users"), {
    //     uid: user.uid,
    //     name: user.displayName,
    //     authProvider: "google",
    //     email: user.email,
    //     });
    // }
};

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
  sundayServiceAuthProvder,
  signInWithDiscord,
  logout,
};