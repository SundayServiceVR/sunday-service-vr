/*
 * Import mapped events into the Firestore emulator.
 *
 * - Reads JSONL produced by exportMappedEvents.ts
 * - Writes docs to Firestore emulator `events` collection
 * - Optional: --clear to delete existing emulator docs in the collection first
 *
 * This never touches production (it forces FIRESTORE_EMULATOR_HOST).
 */

import * as admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const EVENTS_COLLECTION = "events";

type CliOptions = {
    inFile: string;
    clear: boolean;
    limit?: number;
};

function parseCliOptions(argv: string[]): CliOptions {
    const inIndex = argv.findIndex((a) => a === "--in");
    const inFile = inIndex >= 0 ? argv[inIndex + 1] : "./mapped-events.jsonl";
    if (!inFile) throw new Error("Missing value for --in");

    const clear = argv.includes("--clear");

    const limitIndex = argv.findIndex((a) => a === "--limit");
    let limit: number | undefined;
    if (limitIndex >= 0) {
        const raw = argv[limitIndex + 1];
        const parsed = raw ? Number(raw) : NaN;
        if (!Number.isFinite(parsed) || parsed <= 0) {
            throw new Error(`Invalid --limit value '${raw}'. Expected a positive number.`);
        }
        limit = parsed;
    }

    return { inFile, clear, limit };
}

function forceEmulatorTarget() {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
        process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    }
}

function reviveDates(value: unknown): unknown {
    // Our exporter stringifies Dates as ISO strings.
    // For emulator testing, we can keep them as strings or revive to Date.
    // Firestore admin SDK will store JS Date as Timestamp.
    if (Array.isArray(value)) return value.map(reviveDates);
    if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) {
            out[k] = reviveDates(v);
        }
        return out;
    }

    if (typeof value === "string") {
        // Heuristic: ISO-8601 date string.
        // Avoid converting ordinary strings.
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)) {
            const d = new Date(value);
            if (!Number.isNaN(d.getTime())) return d;
        }
    }

    return value;
}

function stripAdminRefs(value: unknown): unknown {
    // Our exporter runs through firebase-admin objects. Those DocumentReferences
    // don't round-trip into the webapp (client SDK) and can break code paths
    // that expect a real firebase/firestore DocumentReference.
    //
    // For emulator UI testing, we either:
    // - rely on signups[].dj_refs (preferred), or
    // - fall back to legacy fields like slots[].dj_name.
    //
    // So we strip these ref-shaped objects to avoid runtime errors.
    if (Array.isArray(value)) return value.map(stripAdminRefs);
    if (!value || typeof value !== "object") return value;

    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (k === "dj_ref" || k === "host_ref") continue;
        if (k === "dj_plays" && Array.isArray(v)) {
            // Drop legacy admin refs.
            continue;
        }
        out[k] = stripAdminRefs(v);
    }
    return out;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ensureLegacySignupsForLineup(value: unknown): unknown {
    // The Lineup UI (`EventLineupSortableList`) only renders a slot if it can find
    // event.signups[] entry matching slot.signup_uuid.
    //
    // Older events can have slots but no signups. Production relies on reconciliation
    // + UI behavior that may differ, but for emulator testing we want the page to show
    // the lineup for legacy events.
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

        // Ensure a stable signup_uuid exists.
        let signup_uuid = typeof slot.signup_uuid === "string" && slot.signup_uuid ? slot.signup_uuid : undefined;
        if (!signup_uuid) {
            signup_uuid = `legacy-slot-${i}`;
            mutated = true;
        }

        if (!signupIds.has(signup_uuid)) {
            // Synthesize a minimal signup.
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
    return {
        ...event,
        slots,
        signups,
    };
}

type ExportLine =
    | { id: string; mapped: unknown; applied?: string[] }
    | { id: string; error: string };

async function clearCollection(db: FirebaseFirestore.Firestore) {
    const snap = await db.collection(EVENTS_COLLECTION).get();
    if (snap.empty) return 0;

    let deleted = 0;
    // Simple batch delete.
    let batch = db.batch();
    let ops = 0;

    for (const d of snap.docs) {
        batch.delete(d.ref);
        deleted++;
        ops++;
        if (ops >= 450) {
            await batch.commit();
            batch = db.batch();
            ops = 0;
        }
    }

    if (ops) await batch.commit();
    return deleted;
}

async function main() {
    const argv = process.argv.slice(2);
    forceEmulatorTarget();
    const cli = parseCliOptions(argv);

    const adminKeyPath = "../functions/local_admin_key.json";
    const serviceAccount = JSON.parse(readFileSync(adminKeyPath, "utf-8"));

    initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "sunday-service-vr",
    });

    const db = getFirestore();

    if (cli.clear) {
        const deleted = await clearCollection(db);
        console.log(`Cleared emulator collection '${EVENTS_COLLECTION}': deleted ${deleted} docs`);
    }

    const raw = readFileSync(cli.inFile, "utf-8");
    const lines = raw.split(/\r?\n/).filter(Boolean);

    let imported = 0;
    let skipped = 0;
    let failed = 0;

    const take = cli.limit ? Math.min(cli.limit, lines.length) : lines.length;

    for (let i = 0; i < take; i++) {
        const line = lines[i];
        let parsed: ExportLine;
        try {
            parsed = JSON.parse(line) as ExportLine;
        } catch (e) {
            failed++;
            continue;
        }

        if ((parsed as any).error) {
            skipped++;
            continue;
        }

        const { id, mapped } = parsed as any;
        if (!id) {
            failed++;
            continue;
        }

    const revived = reviveDates(mapped);
    const sanitized = stripAdminRefs(revived);
    const withLegacySignups = ensureLegacySignupsForLineup(sanitized);
    await db.collection(EVENTS_COLLECTION).doc(id).set(withLegacySignups as any, { merge: false });
        imported++;

        if (imported % 50 === 0) {
            console.log(`Imported ${imported}/${take}...`);
        }
    }

    console.log(
        [
            `Imported into emulator collection='${EVENTS_COLLECTION}'`,
            `from=${cli.inFile}`,
            `lines=${lines.length}`,
            `imported=${imported}`,
            `skipped(error lines)=${skipped}`,
            `failed(parse/validation)=${failed}`,
            `FIRESTORE_EMULATOR_HOST=${process.env.FIRESTORE_EMULATOR_HOST}`,
        ].join(" | ")
    );
}

main().catch((err) => {
    const message = (err as Error)?.message ?? String(err);
    if (message.includes("ECONNREFUSED") && message.includes("127.0.0.1:8080")) {
        console.error(
            "Could not connect to the Firestore emulator at 127.0.0.1:8080. " +
                "Start the emulator (e.g. from `webapp/` with `npm run start:emulator`) or set FIRESTORE_EMULATOR_HOST to a reachable host."
        );
    } else {
        console.error(err);
    }
    process.exitCode = 1;
});
