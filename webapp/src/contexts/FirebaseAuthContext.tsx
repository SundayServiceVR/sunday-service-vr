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
      console.log('FirebaseAuthProvider: Setting up auth state listener');
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('FirebaseAuthProvider: Auth state changed', { user: user ? 'logged in' : 'logged out', uid: user?.uid });
        setUser(user);
      });
      setAuthInstance(auth);
      
      return () => {
        console.log('FirebaseAuthProvider: Cleaning up auth state listener');
        unsubscribe();
      };
  }, []);

  React.useEffect(() => {
    (async () => {
      console.log('FirebaseAuthProvider: Fetching user roles', { user: user ? 'logged in' : user === null ? 'logged out' : 'pending' });
      
      // Only fetch roles if user is actually logged in (not null or "Pending")
      if (user && user !== "Pending") {
        try {
          const token = await user.getIdTokenResult();
          const userRoles = token?.claims.roles as string[];
          console.log('FirebaseAuthProvider: User roles fetched', { roles: userRoles });
          setRoles(userRoles);
        } catch (error) {
          console.error('FirebaseAuthProvider: Error fetching user roles', error);
          setRoles([]); // Set empty roles on error
        }
      } else {
        console.log('FirebaseAuthProvider: Clearing roles (user not logged in)');
        setRoles(undefined); // Clear roles when user is not logged in
      }
    })();
  }, [user]);


  if(user === "Pending") {
    console.log('FirebaseAuthProvider: User authentication pending, showing spinner');
    return <Spinner type="logo" />;
  }

  if(user === null) {
    console.log('FirebaseAuthProvider: User not authenticated, redirecting to login');
    sessionStorage.setItem('preAuthRedirect', window.location.href);
    window.location.href = '/login';
    return <div>Unauthorized</div>;
  }

  console.log('FirebaseAuthProvider: User authenticated, rendering children', { uid: user.uid, roles });


  return (
    <FirebaseAuthContext.Provider value={{ user, auth: authInstance, roles }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export { FirebaseAuthProvider, FirebaseAuthContext };