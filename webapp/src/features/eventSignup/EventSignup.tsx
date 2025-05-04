import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { APIUser } from 'discord-api-types/v10';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DiscordUserInfo } from './DiscordUserInfo';
import { SignupForm } from './SignupForm';
import { getAuth } from 'firebase/auth';

const EventSignup = () => {
    const [discordInfo, setDiscordInfo] = useState<APIUser | null>(null);

    return (
        <div>
            {discordInfo ? (
                <div>
                    <DiscordUserInfo discordInfo={discordInfo} />
                    <button onClick={handleLogout} className="btn btn-secondary mt-3">Logout</button>
                    <SignupForm />
                </div>
            ) : (
                <button onClick={handleLogin} className="btn btn-primary">Login with Discord</button>
            )}
        </div>
    );
};

export { EventSignup };