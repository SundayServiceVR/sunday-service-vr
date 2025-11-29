import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { authenticate } from "../discordAuth/authenticate";
import { allowMethod } from "./allowMethod";
import { docToEvent } from "../../../webapp/src/store/converters";
import corsOptions from "./corsOptions";

const db = admin.firestore();

export const eventSignupGetEventAndDj = functions.https.onRequest(
    {
        ...corsOptions,
    },
    async (req, res) => {
        allowMethod(req, res, "GET");
        const { discord_id } = await authenticate(req, res);

        const { event_id } = req.query;
        if (!event_id) {
            res.status(400).send("Missing event_id parameter");
            return;
        }

        // Fetch Event record
        const eventSnap = await db.collection("events").doc(event_id as string).get();
        if (!eventSnap.exists) {
            res.status(404).send("Event not found");
            return;
        }

        // Fetch DJ record
        const djSnap = await db.collection("djs").where("discord_id", "==", discord_id).limit(1).get();
        if (djSnap.empty) {
            res.status(404).send("DJ record not found");
            return;
        }

        const sanitizedEvent = docToEvent(eventSnap);

        // Remove signups that do not match the DJ
        sanitizedEvent.signups = sanitizedEvent.signups.filter((signup) => {
            return signup.dj_refs.some((ref) => ref.path === djSnap.docs[0].ref.path);
        });

        res.send({
            event: sanitizedEvent,
            dj: djSnap.docs[0].data(),
        });
    }
);
