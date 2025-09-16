// FirebaseAuthContext.tsx
import * as React from "react";
import { Auth, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../util/firebase";
import Spinner from "../components/spinner/Spinner";

type FirebaseAuthContextType = { 
  user?: User, 
  auth?: Auth, 
  roles?: string[],
  isSimulatingRoles?: boolean,
  actualRoles?: string[],
  setSimulatedRoles?: (roles: string[]) => void,
  clearRoleSimulation?: () => void
};

const FirebaseAuthContext =
  React.createContext<FirebaseAuthContextType>({});

type Props = {
  children: React.ReactNode
}

const FirebaseAuthProvider = ({ children }: Props) => {
  const [user, setUser] = React.useState<User | null | "Pending">("Pending");
  const [authInstance, setAuthInstance] = React.useState<Auth>();
  const [roles, setRoles] = React.useState<string[]>();
  const [actualRoles, setActualRoles] = React.useState<string[]>();
  const [simulatedRoles, setSimulatedRolesState] = React.useState<string[] | null>(null);
  
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

          // BUGFIXED: Sometimes, users are logged in, but the call to actually fetch roles is never made.
          // I think this happens when the user is already logged in successfully via refresh token, and no call is made to fetch them.
          // This hopefully patches the issue by 
          if(userRoles === undefined) {
            redirectToLogin();
          }

          console.log('FirebaseAuthProvider: User roles fetched', { roles: userRoles });
          setActualRoles(userRoles);
          
          // Load simulated roles from localStorage if user is a developer
          const savedSimulatedRoles = localStorage.getItem('simulatedRoles');
          if (userRoles.includes('developer') && savedSimulatedRoles) {
            try {
              const parsedSimulatedRoles = JSON.parse(savedSimulatedRoles);
              setSimulatedRolesState(parsedSimulatedRoles);
              setRoles(parsedSimulatedRoles);
            } catch (error) {
              console.error('Error parsing simulated roles from localStorage:', error);
              setRoles(userRoles);
            }
          } else {
            setRoles(userRoles);
          }
        } catch (error) {
          console.error('FirebaseAuthProvider: Error fetching user roles', error);
          setRoles([]); // Set empty roles on error
          setActualRoles([]);
        }
      } else {
        console.log('FirebaseAuthProvider: Clearing roles (user not logged in)');
        setRoles(undefined); // Clear roles when user is not logged in
        setActualRoles(undefined);
        setSimulatedRolesState(null);
      }
    })();
  }, [user]);

  // Role simulation functions
  const setSimulatedRoles = React.useCallback((newRoles: string[]) => {
    if (actualRoles?.includes('developer')) {
      setSimulatedRolesState(newRoles);
      setRoles(newRoles);
      localStorage.setItem('simulatedRoles', JSON.stringify(newRoles));
      console.log('FirebaseAuthProvider: Role simulation set', { simulatedRoles: newRoles });
    }
  }, [actualRoles]);

  const clearRoleSimulation = React.useCallback(() => {
    setSimulatedRolesState(null);
    setRoles(actualRoles);
    localStorage.removeItem('simulatedRoles');
    console.log('FirebaseAuthProvider: Role simulation cleared');
  }, [actualRoles]);


  if(user === "Pending") {
    console.log('FirebaseAuthProvider: User authentication pending, showing spinner');
    return <Spinner type="logo" />;
  }

  if(user === null) {
    console.log('FirebaseAuthProvider: User not authenticated, redirecting to login');
    redirectToLogin();
    return <div>Unauthorized</div>;
  }

  console.log('FirebaseAuthProvider: User authenticated, rendering children', { uid: user.uid, roles });


  return (
    <FirebaseAuthContext.Provider value={{ 
      user, 
      auth: authInstance, 
      roles,
      isSimulatingRoles: simulatedRoles !== null,
      actualRoles,
      setSimulatedRoles,
      clearRoleSimulation
    }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

function redirectToLogin() {
  sessionStorage.setItem('preAuthRedirect', window.location.href);
  window.location.href = '/login';
}

export { FirebaseAuthProvider, FirebaseAuthContext };