// FirebaseAuthContext.tsx
import * as React from "react";
import firebase from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, User } from "firebase/auth";
import { auth, sundayServiceAuthProvder } from "../firebase/config";

type ContextState = { user: User | null };

const FirebaseAuthContext =
  React.createContext<ContextState | null>(null);

type Props = {
  children: any
}

const FirebaseAuthProvider = ({ children }: Props) => {
  const [user, setUser] = React.useState<User | null>( null );
  const value: ContextState = { user };

  React.useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((nextUser) => { setUser(nextUser) });
    return unsubscribe;
  }, []);

  if(!user) {
    signInWithRedirect(auth, sundayServiceAuthProvder);
  }

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export { FirebaseAuthProvider };