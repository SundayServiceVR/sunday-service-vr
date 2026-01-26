import * as admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

function forceEmulatorTarget() {
    process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
}

function describeRef(ref: any) {
    if (!ref || typeof ref !== "object") return { kind: typeof ref, ref };

    return {
        ctor: ref?.constructor?.name,
        hasId: typeof ref.id === "string",
        id: ref?.id,
        hasPath: typeof ref.path === "string",
        path: ref?.path,
        has_path_segments: !!ref?._path?.segments,
        _path_segments: Array.isArray(ref?._path?.segments) ? ref._path.segments : undefined,
        keys: Object.keys(ref),
    };
}

async function main() {
    const eventId = process.argv[2];
    if (!eventId) {
        throw new Error("Usage: node -r ts-node/register inspectEmulatorEventDjRefs.ts <eventId>");
    }

    forceEmulatorTarget();

    const adminKeyPath = "../functions/local_admin_key.json";
    const serviceAccount = JSON.parse(readFileSync(adminKeyPath, "utf-8"));

    // Initialize only once.
    if (!admin.apps.length) {
        initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: "sunday-service-vr",
        });
    }

    const db = getFirestore();

    const snap = await db.collection("events").doc(eventId).get();
    if (!snap.exists) {
        console.log(`Event not found: ${eventId}`);
        return;
    }

    const data = snap.data() as any;
    const signups = Array.isArray(data?.signups) ? data.signups : [];

    console.log(`Event ${eventId}: signups=${signups.length}`);

    for (const s of signups.slice(0, 10)) {
        const uuid = s?.uuid;
        const name = s?.name;
        const refs = Array.isArray(s?.dj_refs) ? s.dj_refs : [];

        console.log(`- signup uuid=${uuid} name=${name} dj_refs=${refs.length}`);
        if (refs[0]) {
            console.log(`  dj_refs[0]:`, describeRef(refs[0]));
        }
    }
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
