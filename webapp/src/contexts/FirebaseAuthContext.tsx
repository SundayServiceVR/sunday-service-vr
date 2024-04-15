// FirebaseAuthContext.tsx
import * as React from "react";
import { getAuth, User } from "firebase/auth";
import { signInWithDiscord } from "../firebase/auth";
import LoginToDiscord from "../components/LoginToDiscord";

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
    const unsubscribe = getAuth().onAuthStateChanged((nextUser) => { setUser(nextUser); console.log(`Auth State Change: ${nextUser?.displayName}`)});
    return unsubscribe;
  }, []);


  return (
    <FirebaseAuthContext.Provider value={value}>
      {user ? children : <LoginToDiscord />}
    </FirebaseAuthContext.Provider>
  );
};

export { FirebaseAuthProvider };