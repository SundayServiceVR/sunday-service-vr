/*
 * Seed Firestore emulator with production data.
 *
 * Requirements:
 * - Copy ALL top-level collections from prod to emulator.
 * - Only apply mapping/transforms to the `events` collection (same mapping we use in the audit).
 * - Do not write to prod.
 *
 * Notes:
 * - This is a best-effort copier for local testing. It doesn't try to preserve
 *   indexes/TTL/etc.
 * - It only copies top-level collections (not arbitrary subcollections). If we
 *   later need subcollections, we can extend it.
 */

import * as admin from "firebase-admin";
import { initializeApp, App as AdminApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

import { docToEventRaw } from "../webapp/src/store/converters";
import { mapLegacyEventTowardsSchema } from "./eventShapeAudit";

type CliOptions = {
    clear: boolean;
    collectionsOverride?: string[];
    includeCollections?: Set<string>;
    excludeCollections: Set<string>;
    limitPerCollection?: number;
};

function parseCliOptions(argv: string[]): CliOptions {
    const clear = argv.includes("--clear");

    const collectionsIdx = argv.findIndex((a) => a === "--collections");
    const collectionsRaw = collectionsIdx >= 0 ? argv[collectionsIdx + 1] : undefined;
    const collectionsOverride = collectionsRaw
        ? collectionsRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

    const includeIdx = argv.findIndex((a) => a === "--include");
    const includeRaw = includeIdx >= 0 ? argv[includeIdx + 1] : undefined;
    const includeCollections = includeRaw
        ? new Set(includeRaw.split(",").map((s) => s.trim()).filter(Boolean))
        : undefined;

    const excludeIdx = argv.findIndex((a) => a === "--exclude");
    const excludeRaw = excludeIdx >= 0 ? argv[excludeIdx + 1] : "";
    const excludeCollections = new Set(excludeRaw.split(",").map((s) => s.trim()).filter(Boolean));

    const limitIdx = argv.findIndex((a) => a === "--limit");
    let limitPerCollection: number | undefined;
    if (limitIdx >= 0) {
        const raw = argv[limitIdx + 1];
        const parsed = raw ? Number(raw) : NaN;
        if (!Number.isFinite(parsed) || parsed <= 0) {
            throw new Error(`Invalid --limit value '${raw}'. Expected a positive number.`);
        }
        limitPerCollection = parsed;
    }

    return { clear, collectionsOverride, includeCollections, excludeCollections, limitPerCollection };
}

function initAdminApp(appName: string, projectId: string) {
    const adminKeyPath = "../functions/local_admin_key.json";
    const serviceAccount = JSON.parse(readFileSync(adminKeyPath, "utf-8"));
    return initializeApp(
        {
            credential: admin.credential.cert(serviceAccount),
            projectId,
        },
        appName
    );
}

async function listTopLevelCollections(db: FirebaseFirestore.Firestore): Promise<string[]> {
    const cols = await db.listCollections();
    return cols.map((c) => c.id).sort();
}

function getProdDb(app: AdminApp) {
    // Ensure we don't talk to the emulator.
    delete process.env.FIRESTORE_EMULATOR_HOST;
    return getFirestore(app);
}

function getEmulatorDb(app: AdminApp) {
    process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
    return getFirestore(app);
}

function reviveDates(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(reviveDates);
    if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) out[k] = reviveDates(v);
        return out;
    }

    if (typeof value === "string") {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)) {
            const d = new Date(value);
            if (!Number.isNaN(d.getTime())) return d;
        }
    }

    return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stripAdminRefs(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(stripAdminRefs);
    if (!value || typeof value !== "object") return value;

    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (k === "dj_ref" || k === "host_ref") continue;
        if (k === "dj_plays" && Array.isArray(v)) continue;
        out[k] = stripAdminRefs(v);
    }
    return out;
}

function ensureLegacySignupsForLineup(value: unknown): unknown {
    if (!isPlainObject(value)) return value;
    const event = value as Record<string, unknown>;

    const slotsRaw = event.slots;
    if (!Array.isArray(slotsRaw) || slotsRaw.length === 0) return value;

    const signupsRaw = event.signups;
    const signups: unknown[] = Array.isArray(signupsRaw) ? [...signupsRaw] : [];
    const signupIds = new Set(
        signups
            .filter(isPlainObject)
            .map((s) => (typeof s.uuid === "string" ? s.uuid : ""))
            .filter(Boolean)
    );

    let mutated = false;

    const slots = slotsRaw.map((slot, i) => {
        if (!isPlainObject(slot)) return slot;

        let signup_uuid = typeof slot.signup_uuid === "string" && slot.signup_uuid ? slot.signup_uuid : undefined;
        if (!signup_uuid) {
            signup_uuid = `legacy-slot-${i}`;
            mutated = true;
        }

        if (!signupIds.has(signup_uuid)) {
            mutated = true;
            signupIds.add(signup_uuid);
            signups.push({
                uuid: signup_uuid,
                name: (slot.dj_name as string | undefined) ?? "Unknown Name",
                dj_refs: [],
                is_debut: (slot.is_debut as boolean | undefined) ?? false,
                requested_duration: (slot.duration as number | undefined) ?? 1,
                type: (slot.slot_type as unknown) ?? "LIVE",
            });
        }

        if (signup_uuid !== slot.signup_uuid) {
            return { ...slot, signup_uuid };
        }
        return slot;
    });

    if (!mutated) return value;
    return { ...event, slots, signups };
}

async function clearCollections(db: FirebaseFirestore.Firestore, collections: string[]) {
    for (const col of collections) {
        const snap = await db.collection(col).get();
        if (snap.empty) continue;

        let batch = db.batch();
        let ops = 0;
        let deleted = 0;

        for (const d of snap.docs) {
            batch.delete(d.ref);
            ops++;
            deleted++;
            if (ops >= 450) {
                await batch.commit();
                batch = db.batch();
                ops = 0;
            }
        }
        if (ops) await batch.commit();
        console.log(`Cleared emulator collection '${col}': deleted ${deleted} docs`);
    }
}

async function copyCollection(
    prodDb: FirebaseFirestore.Firestore,
    emuDb: FirebaseFirestore.Firestore,
    collectionId: string,
    limitPerCollection?: number
) {
    const query = limitPerCollection
        ? prodDb.collection(collectionId).limit(limitPerCollection)
        : prodDb.collection(collectionId);
    const snap = await query.get();

    let imported = 0;
    let mapped = 0;

    for (const doc of snap.docs) {
        let data: unknown = doc.data();

        if (collectionId === "events") {
            // 1) Normalize timestamps etc (same as the app)
            const normalized = docToEventRaw(data);
            // 2) Apply our legacy mapping (stream_link, is_debut, etc)
            const result = mapLegacyEventTowardsSchema(normalized);
            data = result.mapped;
            if (result.applied.length) mapped++;

            // 3) Sanitize for emulator/webapp
            data = reviveDates(data);
            data = stripAdminRefs(data);
            data = ensureLegacySignupsForLineup(data);
        }

        await emuDb.collection(collectionId).doc(doc.id).set(data as any, { merge: false });
        imported++;

        if (imported % 200 === 0) {
            console.log(`  ${collectionId}: imported ${imported}/${snap.size}...`);
        }
    }

    console.log(`Copied collection '${collectionId}' docs=${snap.size} | imported=${imported}${collectionId === "events" ? ` | mapped=${mapped}` : ""}`);
}

async function main() {
    const argv = process.argv.slice(2);
    const cli = parseCliOptions(argv);

    const projectId = "sunday-service-vr";

    // Use two separate app instances so emulator/prod targeting can't interfere.
    const prodApp = initAdminApp("prod", projectId);
    const emuApp = initAdminApp("emulator", projectId);

    const prodDb = getProdDb(prodApp);
    const emuDb = getEmulatorDb(emuApp);

    const FALLBACK_COLLECTIONS = [
        // Known collections in this project (seen in previous runs)
        "bingo_cards",
        "bingo_games",
        "club",
        "djs",
        "events",
        "global",
        "hosts",
        "whiteboards",
    ];

    let allCollections = cli.collectionsOverride ?? (await listTopLevelCollections(prodDb));
    if (!allCollections.length) {
        allCollections = FALLBACK_COLLECTIONS;
    }

    const selected = allCollections.filter((c) => {
        if (cli.includeCollections && !cli.includeCollections.has(c)) return false;
        if (cli.excludeCollections.has(c)) return false;
        return true;
    });

    console.log(
        [
            `Prod collections=${allCollections.length}`,
            `Selected collections=${selected.length}`,
            `Selected=[${selected.join(", ")}]`,
            `Emulator host=${process.env.FIRESTORE_EMULATOR_HOST}`,
            `clear=${cli.clear}`,
            `limitPerCollection=${cli.limitPerCollection ?? "(none)"}`,
            `events only mapped: yes`,
        ].join(" | ")
    );

    if (cli.clear) {
        await clearCollections(emuDb, selected);
    }

    for (const col of selected) {
        await copyCollection(prodDb, emuDb, col, cli.limitPerCollection);
    }

    console.log("Done seeding emulator.");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
