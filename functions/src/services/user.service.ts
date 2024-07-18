import { getFirestore } from "firebase-admin/firestore";
import { DJ, NewDJ } from "../interfaces/dj.interface";

const db = getFirestore();
db.settings({ "ignoreUndefinedProperties": true });

export const findUser = async (userId: string): Promise<DJ | null> => {
    try {
        const user = await db.collection("djs")
            .doc(userId)
            .get();
        if (!user.exists) {
            return null;
        }
        return {
            id: user.id,
            ...user.data(),
        } as DJ;
    } catch (error) {
        if (error instanceof Error) {
            console.log(`SEARCH USER ERROR: ${error.message}`);
            throw new Error(error.message);
        } else {
            throw new Error(error as string);
        }
    }
};

export const findUserByDiscordId =
    async (userId: string): Promise<DJ | null> => {
        try {
            const users = await db.collection("djs")
                .where("discordId", "==", userId)
                .get();
            if (users.empty) {
                return null;
            }
            const user = users.docs[0];
            return {
                id: user.id,
                ...user.data(),
            } as DJ;
        } catch (error) {
            if (error instanceof Error) {
                console.log(`SEARCH USER ERROR: ${error.message}`);
                throw new Error(error.message);
            } else {
                throw new Error(error as string);
            }
        }
    };

export const getUsers = async (): Promise<DJ[]> => {
    try {
        const users: DJ[] = [];
        const data = await db.collection("users")
            .orderBy("createdAt", "desc")
            .get();
        data.forEach((user) => {
            users.push({
                id: user.id,
                ...user.data(),
            } as DJ);
        });
        return users;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error getting users: ${error}`);
            throw new Error(error.message);
        } else {
            throw new Error(error as string);
        }
    }
};

export const newUser = async (profile: NewDJ): Promise<DJ> => {
    try {
        const userRecord = await db.collection("djs").add(profile);
        const userData = await userRecord.get();
        return { id: userData.id, ...userData.data() } as DJ;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error creating a user: ${error}`);
            throw new Error(error.message);
        } else {
            throw new Error(error as string);
        }
    }
};
