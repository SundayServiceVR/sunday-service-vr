/*
 * Export mapped events from Production.
 *
 * - Reads Firestore `events` from prod using firebase-admin (service account).
 * - Normalizes via docToEventRaw.
 * - Applies mapLegacyEventTowardsSchema (dry-run mapping).
 * - Writes a JSONL file: one line per event doc.
 *
 * This never writes to production.
 */

import * as admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, writeFileSync } from "fs";

import { docToEventRaw } from "../webapp/src/store/converters";
import { mapLegacyEventTowardsSchema } from "./eventShapeAudit";

const EVENTS_COLLECTION = "events";

type CliOptions = {
    outFile: string;
    limit?: number;
};

function parseCliOptions(argv: string[]): CliOptions {
    const outIndex = argv.findIndex((a) => a === "--out");
    const outFile = outIndex >= 0 ? argv[outIndex + 1] : "./mapped-events.jsonl";
    if (!outFile) throw new Error("Missing value for --out");

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

    return { outFile, limit };
}

function assertProdTarget(argv: string[]) {
    if (!argv.includes("--prod")) {
        throw new Error("This exporter only supports --prod (safety). Use --prod explicitly.");
    }
    // Make sure we don't talk to the emulator.
    delete process.env.FIRESTORE_EMULATOR_HOST;
}

function safeJsonStringify(value: unknown) {
    return JSON.stringify(value, (_key, v) => (v instanceof Date ? v.toISOString() : v));
}

async function main() {
    const argv = process.argv.slice(2);
    assertProdTarget(argv);
    const cli = parseCliOptions(argv);

    const adminKeyPath = "../functions/local_admin_key.json";
    const serviceAccount = JSON.parse(readFileSync(adminKeyPath, "utf-8"));

    initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "sunday-service-vr",
    });

    const db = getFirestore();

    const snapshot = cli.limit
        ? await db.collection(EVENTS_COLLECTION).limit(cli.limit).get()
        : await db.collection(EVENTS_COLLECTION).get();

    const lines: string[] = [];
    let converted = 0;
    let mappedAny = 0;
    let failed = 0;

    for (const doc of snapshot.docs) {
        try {
            const normalized = docToEventRaw(doc.data());
            const mapped = mapLegacyEventTowardsSchema(normalized);
            if (mapped.applied.length) mappedAny++;

            lines.push(
                safeJsonStringify({
                    id: doc.id,
                    mapped: mapped.mapped,
                    applied: mapped.applied,
                })
            );
            converted++;
        } catch (e) {
            failed++;
            lines.push(
                safeJsonStringify({
                    id: doc.id,
                    error: (e as Error).message ?? String(e),
                })
            );
        }
    }

    writeFileSync(cli.outFile, lines.join("\n") + "\n", "utf-8");

    console.log(
        [
            `Exported ${snapshot.size} docs from '${EVENTS_COLLECTION}'`,
            `Wrote: ${cli.outFile}`,
            `Converted: ${converted}`,
            `Mapped(any rules applied): ${mappedAny}`,
            `Failed: ${failed}`,
        ].join(" | ")
    );
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
