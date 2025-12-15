import * as admin from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";
import { Request, Response } from "@google-cloud/functions-framework";


export const authenticate = async (req: Request, res: Response) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
        res.status(401).send("Unauthorized");
        throw new Error("Unauthorized: No Bearer token provided");
    }
    const idToken = auth.split("Bearer ")[1];
    let decoded: DecodedIdToken;
    try {
        decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
        res.status(401).send("Invalid token");
        throw new Error("Unauthorized: Invalid token");
    }
    const discord_id = decoded.discord_id;
    if (!discord_id) {
        res.status(400).send("discordId not found in user claims");
        throw new Error("Bad Request: discordId not found in user claims");
    }

    return { discord_id };
};
