import { useEffect, useState } from 'react';
import Spinner from '../../components/spinner';
import { Alert } from 'react-bootstrap';
import { getAuth, signInWithCustomToken, updateProfile } from "firebase/auth";
import { Dj } from '../../util/types';

const DiscordRedirect = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [authRequest, setAuthRequest] = useState<Promise<any>>();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authRequest != undefined) {
            return;
        }

        const authenticateWithDiscord = async () => {
            try {
                const response = await fetch(process.env.NODE_ENV === 'production' 
                    ? 'https://us-central1-sunday-service-vr.cloudfunctions.net/discordAuth' 
                    : 'http://127.0.0.1:5001/sunday-service-vr/us-central1/discordAuth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: new URLSearchParams(window.location.search).get('code'),
                        redirect_uri: window.location.origin + '/discordRedirect',
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to authenticate with Discord');
                }

                const { firebase_token, synced_dj_data }: { firebase_token: string, synced_dj_data: Dj } = await response.json();
                const auth = getAuth();
                const userCredentials = await signInWithCustomToken(auth, firebase_token);
                const user = userCredentials.user;

                await updateProfile(user, {
                    displayName: synced_dj_data.public_name,
                    photoURL: synced_dj_data.avatar
                });

                const redirectTarget = sessionStorage.getItem('preAuthRedirect') ?? `/`;
                window.location.replace(redirectTarget);
            } catch (error) {
                console.error('Error during Discord authentication:', error);
                setError('Authentication failed. Please try again.');
            }
        };

        setAuthRequest(authenticateWithDiscord());
    }, [authRequest]);

    return (
        <>
            {
                error 
                    ? <Alert variant="danger">{error}</Alert>
                    : <Spinner type='logo' />
            }
        </>
    );
};

export { DiscordRedirect };