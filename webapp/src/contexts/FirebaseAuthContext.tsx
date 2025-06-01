// FirebaseAuthContext.tsx
import * as React from "react";
import { Auth, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../util/firebase";
import Spinner from "../components/spinner/Spinner";

type FirebaseAuthContextType = { user?: User, auth?: Auth, roles?: string[] };

const FirebaseAuthContext =
  React.createContext<FirebaseAuthContextType>({});

type Props = {
  children: React.ReactNode
}

const FirebaseAuthProvider = ({ children }: Props) => {
  const [user, setUser] = React.useState<User | null | "Pending">("Pending");
  const [authInstance, setAuthInstance] = React.useState<Auth>();
  const [roles, setRoles] = React.useState<string[]>();
  
  React.useEffect(() => {
      onAuthStateChanged(auth, setUser);
      setAuthInstance(auth);
  }, []);

  React.useEffect(() => {
    (async () => {
      const token = await auth?.currentUser?.getIdTokenResult();
      setRoles(token?.claims.roles as string[]);
    })();
  }, [user]);


  if(user === "Pending") {
    return <Spinner type="logo" />;
  }

  if(user === null) {
    sessionStorage.setItem('preAuthRedirect', window.location.href);
    window.location.href = '/login';
    return <div>Unauthorized</div>;
  }


  return (
    <FirebaseAuthContext.Provider value={{ user, auth: authInstance, roles }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export { FirebaseAuthProvider, FirebaseAuthContext };