// FirebaseAuthContext.tsx
import * as React from "react";
import { getAuth, User } from "firebase/auth";
import { Navigate } from "react-router"

import Spinner from "../components/spinner";

type ContextState = { user: User | false | null };

const FirebaseAuthContext =
  React.createContext<ContextState | false | null>(null);

type Props = {
  children: React.ReactNode
}

const FirebaseAuthProvider = ({ children }: Props) => {
  const [user, setUser] = React.useState<User | false | null>( null );
  const value: ContextState = { user };

  React.useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((nextUser) => { setUser(nextUser ?? false); });
    return unsubscribe;
  }, []);

  if(user === false) {
    return <Navigate to="/login" />
  }

  if(user === null) {
    return <Spinner type="logo" />;
  }

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export { FirebaseAuthProvider };