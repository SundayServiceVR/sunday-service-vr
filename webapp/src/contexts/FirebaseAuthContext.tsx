// FirebaseAuthContext.tsx
import * as React from "react";
import { Auth, onAuthStateChanged, User } from "firebase/auth";
import { auth,} from "../util/firebase";

import logo from '../assets/svg/S4_Logo.svg';
import discordIcon from '../assets/svg/Discord-Symbol-White.svg';

const loginWithDiscord = () => {

  const clientId = '1225554722916663376';
  const redirectUri = encodeURIComponent(window.location.origin + '/discordRedirect');
  const scope = 'identify guilds.members.read';
  const responseType = 'code';

  const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
  window.location.href = DISCORD_AUTH_URL;
};

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


  if(user === undefined || authInstance === undefined) {
    return <div></div>;
  }

  if(user === false) {

    return <div>Unauthorized</div>;
  }

  if(user === null) {
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