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
  const [user, setUser] = React.useState<User | false | null>();
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


  if(user === undefined && authInstance === undefined) {
    return <Spinner type="logo" />;
  }

  if(user === false) {

    return <div>Unauthorized</div>;
  }

  if(user == undefined) {
      sessionStorage.setItem('preAuthRedirect', window.location.href);
    window.location.href = '/login';
    return (
      <div>Redirecting...</div>
    );
  }

  return (
    <FirebaseAuthContext.Provider value={{ user, auth: authInstance, roles }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export { FirebaseAuthProvider, FirebaseAuthContext };