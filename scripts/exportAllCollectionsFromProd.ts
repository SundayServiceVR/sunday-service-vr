/*
 * Export a fixed set of Firestore collections from Production to local JSONL files.
 *
 * Collections (top-level only):
 * - bingo_cards
 * - bingo_games
 * - club
 * - djs
 * - events  (mapped/normalized)
 * - global
 * - hosts
 * - whiteboards
 *
 * Notes:
 * - No writes to production.
 * - We apply the same mapping logic ONLY to the `events` collection.
 */

import * as admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import * as path from "path";

import { docToEventRaw } from "../webapp/src/store/converters";
import { mapLegacyEventTowardsSchema } from "./eventShapeAudit";

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
    outDir: string;
    limitPerCollection?: number;
};

function parseCliOptions(argv: string[]): CliOptions {
    const outIdx = argv.findIndex((a) => a === "--out-dir");
    const outDir = outIdx >= 0 ? argv[outIdx + 1] : "./seed-exports";
    if (!outDir) throw new Error("Missing value for --out-dir");

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

    return { outDir, limitPerCollection };
}

function assertProd(argv: string[]) {
    if (!argv.includes("--prod")) {
        throw new Error("Safety: this exporter requires --prod.");
    }
    delete process.env.FIRESTORE_EMULATOR_HOST;
}

function safeJsonStringify(value: unknown) {
    return JSON.stringify(value, (_k, v) => {
        // n.b. Firestore Timestamp objects from the admin SDK aren't `Date` instances.
        // They do expose `toDate()`, so we normalize them to ISO strings for JSONL.
        if (v instanceof Date) return v.toISOString();
        if (v && typeof v === "object" && typeof (v as any).toDate === "function") {
            try {
                const d = (v as any).toDate();
                if (d instanceof Date && !Number.isNaN(d.getTime())) return d.toISOString();
            } catch {
                // fall through
            }
        }
        return v;
    });
}

async function exportCollection(db: FirebaseFirestore.Firestore, col: CollectionId, outDir: string, limit?: number) {
    const outFile = path.join(outDir, `${col}.jsonl`);

    const query = limit ? db.collection(col).limit(limit) : db.collection(col);
    const snap = await query.get();

    const lines: string[] = [];
    let mapped = 0;

    for (const doc of snap.docs) {
        let data: unknown = doc.data();

        if (col === "events") {
            const normalized = docToEventRaw(data);
            const result = mapLegacyEventTowardsSchema(normalized);
            data = result.mapped;
            if (result.applied.length) mapped++;
        }

        lines.push(safeJsonStringify({ id: doc.id, data }));
    }

    writeFileSync(outFile, lines.join("\n") + (lines.length ? "\n" : ""), "utf-8");

    console.log(
        `Exported '${col}' docs=${snap.size} -> ${outFile}` + (col === "events" ? ` | mapped=${mapped}` : "")
    );
}

async function main() {
    const argv = process.argv.slice(2);
    assertProd(argv);
    const cli = parseCliOptions(argv);

    mkdirSync(cli.outDir, { recursive: true });

    const adminKeyPath = "../functions/local_admin_key.json";
    const serviceAccount = JSON.parse(readFileSync(adminKeyPath, "utf-8"));

    initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "sunday-service-vr",
    });

    const db = getFirestore();

    for (const col of COLLECTIONS) {
        await exportCollection(db, col, cli.outDir, cli.limitPerCollection);
    }

    console.log(`Done. Export dir: ${cli.outDir}`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
