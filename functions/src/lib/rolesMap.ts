import { AppUserRole } from "../../../webapp/src/util/types";


// 1004489271568248833 - Domoni Poobah            - Discord Admin   -> DJ (s4), Host, Admin
// 1076583666794369044 - Honoratus Hospes           - Host            -> DJ (s4), Host
// 1004490402914643968 - Incola Sacredos          - Founder         -> DJ (s4), Founder
// 1004491516359749722 - Saltare MDusic Hospite   - General Dj      -> DJ (s4)
// x                   - xxx                      - Developer       -> DJ (s4), Host, Developer, Admin

type DiscordRoleToAppUserRole = {
    role: string;
    discordRoleName: string;
    displayName: string;
    appUserRoles: AppUserRole[];
}


const roleNameToAppUserRole = (roleId: string) => {
    const discordRolesMap: {[key: string] : DiscordRoleToAppUserRole} = {

        "1004489271568248833": {
            role: "admin",
            discordRoleName: "Domoni Poobah",
            displayName: "Admin",
            appUserRoles: [{ role: "dj" }, { role: "admin" }],
        },
        "1076583666794369044": {
            role: "host",
            discordRoleName: "Honoratus Hospes",
            displayName: "Host",
            appUserRoles: [{ role: "dj" }, { role: "host" }],
        },
        "1004491516359749722": {
            role: "dj",
            discordRoleName: "Saltare Music Hospite",
            displayName: "General DJ",
            appUserRoles: [{ role: "dj" }],
        },
    };
    return discordRolesMap[roleId]?.appUserRoles ?? [];
};

export const getRolesFromDiscordRoles = (discordRoles: string[]): AppUserRole[] => {
    const roles: Map<string, AppUserRole> = new Map();
    discordRoles.forEach((role) => {
        roleNameToAppUserRole(role).forEach((appUserRole) => {
            const mapKey = `${appUserRole.role}`;
            roles.set(mapKey, appUserRole);
        });
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return [...roles.entries()].map(([_, value]) => value);
};
