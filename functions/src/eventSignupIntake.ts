import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { v4 as uuidv4 } from "uuid";
import { Dj, EventSignup } from "../../webapp/src/util/types";
import { DocumentReference } from "firebase-admin/firestore";
import { DecodedIdToken } from "firebase-admin/auth";

const db = admin.firestore();

export const eventSignupIntake = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    const formData = req.body;

    const { eventId } = formData;
    const { djName, requestedDuration, type } = req.body;
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
        res.status(401).send("Unauthorized");
        return;
    }
    const idToken = auth.split("Bearer ")[1];
    let decoded: DecodedIdToken;
    try {
        decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
        res.status(401).send("Invalid token");
        return;
    }
    const discord_id = decoded.discord_id;
    if (!discord_id) {
        res.status(400).send("discordId not found in user claims");
        return;
    }

    // Fetch DJ record
    const djSnap = await db.collection("djs").where("discord_id", "==", discord_id).limit(1).get();
    if (djSnap.empty) {
        res.status(404).send("DJ record not found");
        return;
    }
    const djDoc = djSnap.docs[0];
    const djData = djDoc.data() as Dj;
    // Check role
    const hasDjRole = (djData.roles || []).some((r) => r.role === "dj");
    if (!hasDjRole) {
        res.status(403).send("Forbidden: DJ role required");
        return;
    }

    // Check debut
    const is_debut = !(djData.events && djData.events.length > 0);
    const djRef: DocumentReference = djDoc.ref;

    // Fetch event
    const eventRef = db.collection("events").doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
        res.status(404).send("Event not found");
        return;
    }
    const eventData = eventSnap.data();
    const signups: EventSignup[] = eventData?.signups || [];

    // Check for existing signup by this DJ
    const existingSignup = signups.find((s) => s.dj_refs && s.dj_refs.some((ref) => ref.path === djRef.path));
    if (existingSignup) {
        // Update existing signup
        existingSignup.name = djName;
        existingSignup.requested_duration = requestedDuration;
        existingSignup.type = type;
        existingSignup.is_debut = is_debut;
        await eventRef.update({ signups });
        res.status(200).send("Signup updated");
        return;
    } else {
        // Create new signup
        const newSignup: EventSignup = {
            name: djName,
            requested_duration: requestedDuration,
            type: type,
            uuid: uuidv4(),
            // @ts-expect-error - Conflict between admin and client DocumentReference types
            dj_refs: [djRef],
            is_debut: is_debut,
        };
        signups.push(newSignup);
        await eventRef.update({ signups });
        res.status(201).send("Signup created");
        return;
    }
});
