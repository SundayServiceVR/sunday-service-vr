export interface DJ {
    id: string
    discordId: string
    discordUsername: string
    djName: string
    email?: string
    logoUrl?: string
    rtmpUrl?: string
    twitchUrl?: string
    token?: string
    refreshToken?: string
}

export interface NewDJ {
    discordId: string
    discordUsername: string
    djName: string
    email?: string
    logoUrl?: string
    rtmpUrl?: string
    twitchUrl?: string
    token?: string
    refreshToken?: string
}
