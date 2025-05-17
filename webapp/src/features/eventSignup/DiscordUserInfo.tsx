import React from 'react';
import { APIUser } from 'discord-api-types/v10';

interface DiscordUserInfoProps {
    discordInfo: APIUser;
}

export const DiscordUserInfo: React.FC<DiscordUserInfoProps> = ({ discordInfo }) => {
    return (
        <div>
            <p>Signing up as</p>
            <p>
                <img
                    src={`https://cdn.discordapp.com/avatars/${discordInfo.id}/${discordInfo.avatar}.png`}
                    alt="Discord Avatar"
                    style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                />
                {discordInfo.global_name || discordInfo.username}
                {discordInfo.email}
            </p>
        </div>
    );
};