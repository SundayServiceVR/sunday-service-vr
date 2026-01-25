/*
 * Import JSONL exports into the Firestore emulator.
 *
 * - Reads files created by exportAllCollectionsFromProd.ts
 * - Clears target collections first (optional)
 * - For `events`, applies emulator-only sanitization:
 *   - revive Dates
 *   - strip admin refs (dj_ref/dj_plays/host_ref)
 *   - synthesize signups for legacy slot-only events so lineup UI renders
 */

import * as admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import * as path from "path";

const COLLECTIONS = [
    "bingo_cards",
    "bingo_games",
    "club",
    "djs",
    "events",
    "global",
    "hosts",
    "whiteboards",
] as const;

type CollectionId = (typeof COLLECTIONS)[number];

type CliOptions = {
    inDir: string;
    clear: boolean;
    limitPerCollection?: number;
};

function parseCliOptions(argv: string[]): CliOptions {
    const inIdx = argv.findIndex((a) => a === "--in-dir");
    const inDir = inIdx >= 0 ? argv[inIdx + 1] : "./seed-exports";
    if (!inDir) throw new Error("Missing value for --in-dir");

    const clear = argv.includes("--clear");

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

    return { inDir, clear, limitPerCollection };
}

function forceEmulatorTarget() {
    process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
}

function reviveDates(value: unknown): unknown {
    // Important: Date is an object, but we want to keep it as-is.
    // If we treat it like a plain object and iterate entries, it becomes `{}`.
    if (value instanceof Date) return value;

    if (Array.isArray(value)) return value.map(reviveDates);
    if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;

        // Handle common timestamp-ish object shapes (defensive).
        // - admin Timestamp JSON: { _seconds, _nanoseconds }
        // - other libs: { seconds, nanoseconds }
        if (typeof obj._seconds === "number" && typeof obj._nanoseconds === "number") {
            return new Date(obj._seconds * 1000 + Math.floor(obj._nanoseconds / 1e6));
        }
        if (typeof obj.seconds === "number" && typeof obj.nanoseconds === "number") {
            return new Date(obj.seconds * 1000 + Math.floor(obj.nanoseconds / 1e6));
        }
        if (typeof obj.seconds === "number" && typeof obj.nanos === "number") {
            return new Date(obj.seconds * 1000 + Math.floor(obj.nanos / 1e6));
        }

        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) out[k] = reviveDates(v);
        return out;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        // Sometimes JSONL ends up with accidental line breaks inside ISO strings (e.g. "...000\nZ").
        // Normalize by removing any whitespace characters.
        const collapsed = trimmed.replace(/\s+/g, "");

        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(collapsed)) {
            const d = new Date(collapsed);
            if (!Number.isNaN(d.getTime())) return d;
        }

        // Also accept ISO strings without trailing Z (rare, but we can treat as UTC).
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(collapsed)) {
            const d = new Date(collapsed + "Z");
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

function ensureSlotReconciledShape(value: unknown): unknown {
    if (!isPlainObject(value)) return value;
    const event = value as Record<string, unknown>;

    const slotsRaw = event.slots;
    if (!Array.isArray(slotsRaw) || slotsRaw.length === 0) return value;

    const signupsRaw = event.signups;
    const signups: unknown[] = Array.isArray(signupsRaw) ? [...signupsRaw] : [];

    const signupByUuid = new Map<string, Record<string, unknown>>();
    for (const sAny of signups) {
        if (!isPlainObject(sAny)) continue;
        const s = sAny as Record<string, unknown>;
        const uuid = typeof s.uuid === "string" ? s.uuid : "";
        if (uuid) signupByUuid.set(uuid, s);
    }

    let mutated = false;

    const slots = slotsRaw.map((slotAny) => {
        if (!isPlainObject(slotAny)) return slotAny;
        const slot = slotAny as Record<string, unknown>;

        const uuid = typeof slot.signup_uuid === "string" ? slot.signup_uuid : "";
        const signup = uuid ? signupByUuid.get(uuid) : undefined;
        if (!signup) return slotAny;

        const reconciled = isPlainObject(slot.reconciled) ? ({ ...(slot.reconciled as any) } as Record<string, unknown>) : {};

        const nextReconciled: Record<string, unknown> = {
            ...reconciled,
            signup: reconciled.signup && isPlainObject(reconciled.signup) ? reconciled.signup : signup,
        };

        // If the slot had a top-level `djs` array from older seeds, migrate it into reconciled.
        if (nextReconciled.djs == null && Array.isArray((slot as any).djs)) {
            nextReconciled.djs = (slot as any).djs;
        }

        // If we still don't have any djs cache, we can attempt a low-effort default
        // from legacy fields.
        if (nextReconciled.djs == null) {
            const dj_name = typeof slot.dj_name === "string" ? slot.dj_name : undefined;
            if (dj_name) nextReconciled.djs = [{ dj_name }];
        }

        // Only write back if something changed or reconciled was missing.
        const hadReconciled = isPlainObject(slot.reconciled);
        const signupSame = hadReconciled && isPlainObject((slot.reconciled as any).signup) && (slot.reconciled as any).signup === signup;
        if (!hadReconciled || !signupSame || nextReconciled.djs !== (slot.reconciled as any)?.djs) {
            mutated = true;
            const { djs: _legacyDjs, ...rest } = slot as any;
            return { ...rest, reconciled: nextReconciled };
        }

        return slotAny;
    });

    if (!mutated) return value;
    return { ...event, slots, signups };
}

type JsonlLine = { id: string; data: unknown };

let DJ_LOOKUP: DjLookup | undefined;

type DjLookup = {
    byDiscordId: Map<string, string>; // discord_id -> dj doc id
    byName: Map<string, string>; // lowercased dj name / public name -> dj doc id
};

function normalizeName(s: unknown): string {
    if (typeof s !== "string") return "";
    return s.trim().toLowerCase();
}

function buildDjLookupFromJsonl(inDir: string): DjLookup {
    const byDiscordId = new Map<string, string>();
    const byName = new Map<string, string>();

    const inFile = path.join(inDir, `djs.jsonl`);
    const raw = readFileSync(inFile, "utf-8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
        try {
            const parsed = JSON.parse(line) as JsonlLine;
            const id = parsed.id;
            const data = parsed.data as any;

            const discordId = data?.discord_id;
            if (discordId != null) byDiscordId.set(String(discordId), id);

            const djName = normalizeName(data?.dj_name);
            if (djName) byName.set(djName, id);
            const publicName = normalizeName(data?.public_name);
            if (publicName) byName.set(publicName, id);
        } catch {
            // ignore malformed
        }
    }

    return { byDiscordId, byName };
}

function inferStreamLinkFromSlot(slot: Record<string, unknown>): string | undefined {
    // Prefer the canonicalized field we write on slots during mapping.
    const fromStreamSource = slot.stream_source_url;
    if (typeof fromStreamSource === "string" && fromStreamSource.trim()) return fromStreamSource.trim();

    // Legacy fallbacks.
    const rtmp = slot.rtmp_url;
    if (typeof rtmp === "string" && rtmp.trim()) return rtmp.trim();

    const twitch = slot.twitch_username;
    if (typeof twitch === "string" && twitch.trim()) return `twitch:${twitch.trim()}`;

    return undefined;
}

function backfillLegacySignupDjRefsAndStreamLinks(
    value: unknown,
    djLookup: DjLookup,
    db: FirebaseFirestore.Firestore
): unknown {
    if (!isPlainObject(value)) return value;
    const event = value as Record<string, unknown>;
    const slotsRaw = event.slots;
    const signupsRaw = event.signups;
    if (!Array.isArray(slotsRaw) || slotsRaw.length === 0) return value;
    if (!Array.isArray(signupsRaw) || signupsRaw.length === 0) return value;

    // Only do this for legacy-ish events where signups exist but dj_refs are missing/empty.
    const hasAnyDjRef = signupsRaw.some(
        (s) => isPlainObject(s) && Array.isArray((s as any).dj_refs) && (s as any).dj_refs.length > 0
    );
    if (hasAnyDjRef) return value;

    const signups = signupsRaw.map((s) => (isPlainObject(s) ? ({ ...s } as Record<string, unknown>) : s));
    const signupByUuid = new Map<string, Record<string, unknown>>();
    for (const s of signups) {
        if (!isPlainObject(s)) continue;
        const uuid = typeof s.uuid === "string" ? s.uuid : "";
        if (uuid) signupByUuid.set(uuid, s);
    }

    let mutated = false;

    for (const slotAny of slotsRaw) {
        if (!isPlainObject(slotAny)) continue;
        const slot = slotAny as Record<string, unknown>;
        const uuid = typeof slot.signup_uuid === "string" ? slot.signup_uuid : "";
        if (!uuid) continue;
        const signup = signupByUuid.get(uuid);
        if (!signup) continue;

        const djsArr = Array.isArray((slot as any)?.reconciled?.djs)
            ? (((slot as any).reconciled.djs) as any[])
            : (Array.isArray((slot as any).djs) ? ((slot as any).djs as any[]) : []);
        const discordId = djsArr?.[0]?.discord_id ?? undefined;
        const djName = normalizeName(djsArr?.[0]?.dj_name ?? slot.dj_name);

        const djId =
            (discordId != null ? djLookup.byDiscordId.get(String(discordId)) : undefined) ||
            (djName ? djLookup.byName.get(djName) : undefined);

        if (djId) {
            mutated = true;
            // Use a *real* DocumentReference so the webapp's signup flow can rely on the
            // reference shape (some parts currently read `ref._path.segments`).
            signup.dj_refs = [db.doc(`djs/${djId}`)];
        }

        const stream_link = inferStreamLinkFromSlot(slot);
        if (stream_link) {
            mutated = true;
            signup.event_signup_form_data = {
                ...(isPlainObject(signup.event_signup_form_data) ? (signup.event_signup_form_data as any) : {}),
                stream_link,
            };
        }
    }

    if (!mutated) return value;
    return { ...event, signups };
}

async function clearCollection(db: FirebaseFirestore.Firestore, col: CollectionId) {
    const snap = await db.collection(col).get();
    if (snap.empty) return 0;

    let batch = db.batch();
    let ops = 0;
    let deleted = 0;

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

async function importCollection(db: FirebaseFirestore.Firestore, col: CollectionId, inDir: string, limit?: number) {
    const inFile = path.join(inDir, `${col}.jsonl`);
    const raw = readFileSync(inFile, "utf-8");
    const lines = raw.split(/\r?\n/).filter(Boolean);

    const take = limit ? Math.min(limit, lines.length) : lines.length;

    let imported = 0;
    let failed = 0;

    for (let i = 0; i < take; i++) {
        const line = lines[i];
        let parsed: JsonlLine;
        try {
            parsed = JSON.parse(line) as JsonlLine;
        } catch {
            failed++;
            continue;
        }

        let data: unknown = parsed.data;
        if (col === "events") {
            // Order matters:
            // - stripAdminRefs walks objects and would otherwise "flatten" Date objects into `{}`
            //   if it ran after reviveDates.
            data = stripAdminRefs(data);
            data = reviveDates(data);
            data = ensureLegacySignupsForLineup(data);
            data = ensureSlotReconciledShape(data);

            if (DJ_LOOKUP) {
                data = backfillLegacySignupDjRefsAndStreamLinks(data, DJ_LOOKUP, db);
            }

            if (i === 0 && isPlainObject(data)) {
                const sd = (data as any).start_datetime;
                const st0 = Array.isArray((data as any).slots) ? (data as any).slots?.[0]?.start_time : undefined;
                console.log(
                    `  events[0] debug: start_datetime=${sd instanceof Date ? `Date(${sd.toISOString()})` : JSON.stringify(sd)}` +
                        ` | slots[0].start_time=${st0 instanceof Date ? `Date(${st0.toISOString()})` : JSON.stringify(st0)}`
                );
            }
        }

        await db.collection(col).doc(parsed.id).set(data as any, { merge: false });
        imported++;

        if (imported % 200 === 0) {
            console.log(`  ${col}: imported ${imported}/${take}...`);
        }
    }

    console.log(`Imported '${col}' docs=${take} (file lines=${lines.length}) | imported=${imported} | failed=${failed}`);
}

async function main() {
    const argv = process.argv.slice(2);
    const cli = parseCliOptions(argv);
    forceEmulatorTarget();

    const adminKeyPath = "../functions/local_admin_key.json";
    const serviceAccount = JSON.parse(readFileSync(adminKeyPath, "utf-8"));

    initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "sunday-service-vr",
    });

    const db = getFirestore();

    // For event backfills we need DJ ids; load a lookup from the local JSONL exports.
    // This avoids doing a full extra emulator read and also works during the import.
    DJ_LOOKUP = buildDjLookupFromJsonl(cli.inDir);

    if (cli.clear) {
        for (const col of COLLECTIONS) {
            const deleted = await clearCollection(db, col);
            if (deleted) console.log(`Cleared emulator '${col}': deleted ${deleted}`);
        }
    }

    console.log(`Importing into emulator at ${process.env.FIRESTORE_EMULATOR_HOST} from dir=${cli.inDir}`);

    for (const col of COLLECTIONS) {
        // Import in the declared order. When importing events, we can use djLookup.
        await importCollection(db, col, cli.inDir, cli.limitPerCollection);
    }

    console.log("Done importing.");
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
