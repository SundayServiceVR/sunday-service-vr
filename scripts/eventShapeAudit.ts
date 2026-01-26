/*
 * Local Event shape audit (maintenance script)
 *
 * This is not part of the webapp bundle. It's meant to be run locally via Node.
 *
 * It reads Firestore `events` docs using firebase-admin (service account) so it
 * can access legacy data without client auth/permission issues.
 *
 * By default it targets the Firestore emulator (127.0.0.1:8080).
 */

import * as admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

import { docToEventRaw } from "../webapp/src/store/converters";
import { buildEventSchema, diffAgainstSchema, formatDiffReport } from "./eventShapeAuditUtil";

const EVENTS_COLLECTION = "events";

type RunMode = "emulator" | "prod";
type CliOptions = {
    summaryOnly: boolean;
    limit?: number;
    ignoreReconciled: boolean;
};

function parseRunMode(argv: string[]): RunMode {
    // Explicit CLI flags win.
    if (argv.includes("--prod")) return "prod";
    if (argv.includes("--emulator")) return "emulator";

    // Env is next.
    const envMode = (process.env.SSVR_FIRESTORE_MODE ?? "").toLowerCase();
    if (envMode === "prod" || envMode === "production") return "prod";
    if (envMode === "emulator") return "emulator";

    // Default is emulator for safety.
    return "emulator";
}

function parseCliOptions(argv: string[]): CliOptions {
    const summaryOnly = argv.includes("--summary-only");
    const ignoreReconciled = argv.includes("--include-reconciled") ? false : true;

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

    return { summaryOnly, limit, ignoreReconciled };
}

function applyFirestoreTarget(mode: RunMode) {
    if (mode === "emulator") {
        // If user didn't set it explicitly, point at localhost emulator.
        if (!process.env.FIRESTORE_EMULATOR_HOST) {
            process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
        }
        return;
    }

    // Production: make sure we don't accidentally talk to the emulator.
    delete process.env.FIRESTORE_EMULATOR_HOST;
}

type MigrationResult = {
    mapped: unknown;
    applied: string[];
};

type DiffSummaryKey = `${string} | ${string}`;

function summarizeDiffs(diffs: { path: string; type: string }[]) {
    const counts = new Map<DiffSummaryKey, number>();
    for (const d of diffs) {
        const key = `${d.type} | ${d.path}` as DiffSummaryKey;
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const sorted = Array.from(counts.entries())
        .map(([key, count]) => {
            const [type, path] = key.split(" | ") as [string, string];
            return { type, path, count };
        })
        .sort((a, b) => b.count - a.count);

    return { counts, sorted };
}

function partitionDiffsForSummary(diffs: { path: string; type: string }[]) {
    const invalid = diffs.filter((d) => d.type === "invalid");
    const actionable = diffs.filter((d) => d.type !== "invalid");
    return { actionable, invalid };
}

function printTopSummary(title: string, summaryRows: { type: string; path: string; count: number }[], topN = 25) {
    const rows = summaryRows.slice(0, topN);
    if (!rows.length) {
        console.log(`\n${title}: (no diffs)`);
        return;
    }

    const countWidth = Math.max("count".length, ...rows.map((r) => String(r.count).length));
    const typeWidth = Math.max("type".length, ...rows.map((r) => r.type.length));

    console.log(`\n${title} (top ${rows.length}):`);
    console.log(`${"count".padStart(countWidth)}  ${"type".padEnd(typeWidth)}  path`);
    console.log(`${"-".repeat(countWidth)}  ${"-".repeat(typeWidth)}  ${"-".repeat(40)}`);
    for (const r of rows) {
        console.log(`${String(r.count).padStart(countWidth)}  ${r.type.padEnd(typeWidth)}  ${r.path}`);
    }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mapLegacyEventTowardsSchema(normalized: unknown): MigrationResult {
    // NOTE: This is a best-effort, non-destructive mapping pass.
    // It should be safe to run against production because it never writes.
    const applied: string[] = [];
    if (!isPlainObject(normalized)) {
        return { mapped: normalized, applied };
    }

    // Clone shallowly. We'll deep-clone only the parts we touch.
    const mapped: Record<string, unknown> = { ...normalized };

    // 1) Legacy schema sometimes uses "debut" instead of "is_debut".
    //    For migration simplicity, we default is_debut to false when missing.
    //    We also remove legacy "debut" fields so they don't show up as extras.
    //    (This is a dry-run mapper; later, if we write, this would be the shape we persist.)
    if (Array.isArray(mapped.signups)) {
        const signups = mapped.signups.map((s) => {
            if (!isPlainObject(s)) return s;

            const needsDefault = s.is_debut === undefined;
            const debutIsBool = typeof s.debut === "boolean";

            const isDebut = debutIsBool ? (s.debut as boolean) : false;

            if (needsDefault && debutIsBool) {
                applied.push("signups[].is_debut inferred from signups[].debut");
            } else if (needsDefault) {
                applied.push("signups[].is_debut defaulted to false");
            }

            if (s.debut !== undefined) {
                applied.push("signups[].debut removed (legacy field)");
            }

            // Legacy: some signups appear to have stream_source_* fields (these belong in
            // event_signup_form_data.stream_link in the current schema).
            const streamSourceUrl = typeof s.stream_source_url === "string" ? s.stream_source_url : undefined;
            const streamSourceType = typeof s.stream_source_type === "string" ? s.stream_source_type : undefined;

            if (streamSourceUrl && streamSourceUrl.trim()) {
                applied.push("signups[].stream_source_url -> event_signup_form_data.stream_link");
            }
            if (streamSourceType !== undefined) {
                applied.push("signups[].stream_source_type removed (legacy field)");
            }
            if (s.stream_source_url !== undefined) {
                applied.push("signups[].stream_source_url removed (legacy field)");
            }

            const existingForm = isPlainObject(s.event_signup_form_data) ? s.event_signup_form_data : undefined;
            const mergedForm = streamSourceUrl
                ? {
                    ...(existingForm ?? {}),
                    stream_link: (existingForm as Record<string, unknown> | undefined)?.stream_link ?? streamSourceUrl,
                }
                : existingForm;

            const { debut: _removedDebut, stream_source_url: _removedUrl, stream_source_type: _removedType, ...rest } = s;
            return {
                ...rest,
                is_debut: (rest as Record<string, unknown>).is_debut ?? isDebut,
                ...(mergedForm ? { event_signup_form_data: mergedForm } : {}),
            };
        });
        mapped.signups = signups;
    }

    if (Array.isArray(mapped.slots)) {
        const slots = mapped.slots.map((slot) => {
            if (!isPlainObject(slot)) return slot;

            // Some legacy documents have slot.start_time already normalized by docToEventRaw.

            // Remove obvious legacy field: slots[].name (we now use reconciled.signup.name / djs[].dj_name).
            if (slot.name !== undefined) {
                applied.push("slots[].name removed (legacy field)");
                const { name: _removed, ...rest } = slot;
                slot = rest;
            }

            // Map reconciled.signup.debut -> reconciled.signup.is_debut (default false) and remove legacy field
            const reconciled = slot.reconciled;
            if (isPlainObject(reconciled) && isPlainObject(reconciled.signup)) {
                const signup = reconciled.signup;
                const needsDefault = signup.is_debut === undefined;
                const debutIsBool = typeof signup.debut === "boolean";
                const isDebut = debutIsBool ? (signup.debut as boolean) : false;

                if (needsDefault && debutIsBool) {
                    applied.push("slots[].reconciled.signup.is_debut inferred from debut");
                } else if (needsDefault) {
                    applied.push("slots[].reconciled.signup.is_debut defaulted to false");
                }

                const { debut: _removed, ...restSignup } = signup;
                const newSignup: Record<string, unknown> = { ...restSignup, is_debut: restSignup.is_debut ?? isDebut };

                if (signup.debut !== undefined) {
                    applied.push("slots[].reconciled.signup.debut removed (legacy field)");
                }

                slot = {
                    ...slot,
                    reconciled: {
                        ...reconciled,
                        signup: newSignup,
                    },
                };
            }

            return slot;
        });

        mapped.slots = slots;
    }

    // 2) Some legacy docs are missing event_signup_form_data.event_id. We can infer it from event.id if present.
    const eventId = typeof mapped.id === "string" && mapped.id.length ? mapped.id : undefined;
    if (eventId && Array.isArray(mapped.signups)) {
        const signups = mapped.signups.map((s) => {
            if (!isPlainObject(s)) return s;
            const form = s.event_signup_form_data;
            if (!isPlainObject(form)) return s;
            if (form.event_id === undefined) {
                applied.push("signups[].event_signup_form_data.event_id inferred from event.id");
                return {
                    ...s,
                    event_signup_form_data: {
                        ...form,
                        event_id: eventId,
                    },
                };
            }
            return s;
        });
        mapped.signups = signups;
    }

    // NOTE: We are intentionally NOT trying to fabricate slots[].reconciled for events
    // that don't have it; that requires business logic (matching signups to slots) and
    // could easily be wrong.

    return { mapped, applied: Array.from(new Set(applied)) };
}

async function main() {
    const argv = process.argv.slice(2);
    const mode = parseRunMode(argv);
    const cli = parseCliOptions(argv);
    applyFirestoreTarget(mode);

    const adminKeyPath = "../functions/local_admin_key.json";
    const serviceAccount = JSON.parse(readFileSync(adminKeyPath, "utf-8"));

    initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "sunday-service-vr",
    });

    console.log(
        [
            `Mode=${mode}`,
            `projectId=sunday-service-vr`,
            `FIRESTORE_EMULATOR_HOST=${process.env.FIRESTORE_EMULATOR_HOST ?? "(not set)"}`,
            `collection=${EVENTS_COLLECTION}`,
            `summaryOnly=${cli.summaryOnly}`,
            `limit=${cli.limit ?? "(none)"}`,
            `ignoreReconciled=${cli.ignoreReconciled}`,
        ].join(" | ")
    );

    const db = getFirestore();
    const schema = buildEventSchema();
    const diffOptions = cli.ignoreReconciled
        ? {
            // Intentionally ignore reconciled fields (both top-level and per-slot)
            // so we can focus on other schema issues.
            ignorePathPrefixes: [
                "reconciled",
                "slots[0].reconciled",
                "slots[1].reconciled",
                "slots[2].reconciled",
            ],
        }
        : {};

    let nonMatching = 0;
    const snapshot = cli.limit
        ? await db.collection(EVENTS_COLLECTION).limit(cli.limit).get()
        : await db.collection(EVENTS_COLLECTION).get();
    let total = 0;

    console.log(`Collection='${EVENTS_COLLECTION}' docs=${snapshot.size}`);

    const allPreMappingDiffs: { path: string; type: string }[] = [];
    const allPostMappingDiffs: { path: string; type: string }[] = [];

    for (const doc of snapshot.docs) {
        total++;

        let normalized: unknown;
        try {
            normalized = docToEventRaw(doc.data());
        } catch (e) {
            nonMatching++;
            console.log(`\n[${doc.id}] ❌ converter failed: ${(e as Error).message}`);
            continue;
        }

        const diffs = diffAgainstSchema(normalized, schema, "", diffOptions);
        if (diffs.length) {
            nonMatching++;

            for (const d of diffs) {
                allPreMappingDiffs.push({ path: d.path, type: d.type });
            }

            const mapped = mapLegacyEventTowardsSchema(normalized);
            const mappedDiffs = diffAgainstSchema(mapped.mapped, schema, "", diffOptions);

            for (const d of mappedDiffs) {
                allPostMappingDiffs.push({ path: d.path, type: d.type });
            }

            if (!cli.summaryOnly) {
                console.log(formatDiffReport(doc.id, diffs));
            }

            if (!cli.summaryOnly) {
                if (mapped.applied.length) {
                    console.log(`\n[${doc.id}] mapped (dry-run). Applied: ${mapped.applied.join(", ")}`);
                } else {
                    console.log(`\n[${doc.id}] mapped (dry-run). Applied: (none)`);
                }
            }

            // Print the mapped JSON so we can reason about what we'd write later.
            // Replacer: show Dates as ISO strings to keep output readable.
            if (!cli.summaryOnly) {
                const mappedJson = JSON.stringify(
                    mapped.mapped,
                    (_key, value) => (value instanceof Date ? value.toISOString() : value),
                    2
                );
                console.log(mappedJson);
            }

            if (!cli.summaryOnly) {
                if (mappedDiffs.length) {
                    console.log(`\n[${doc.id}] remaining mismatches after mapping: ${mappedDiffs.length}`);
                } else {
                    console.log(`\n[${doc.id}] mapped event matches schema (post-mapping)`);
                }
            }
        }
    }

    console.log(`\nDone. Non-matching events: ${nonMatching}/${total}`);

    const preParts = partitionDiffsForSummary(allPreMappingDiffs);
    const postParts = partitionDiffsForSummary(allPostMappingDiffs);

    const preSummary = summarizeDiffs(preParts.actionable);
    const postSummary = summarizeDiffs(postParts.actionable);
    printTopSummary("Summary: mismatches BEFORE mapping (actionable)", preSummary.sorted, 25);
    printTopSummary("Summary: mismatches AFTER mapping (actionable)", postSummary.sorted, 25);

    const preInvalid = summarizeDiffs(preParts.invalid);
    const postInvalid = summarizeDiffs(postParts.invalid);
    printTopSummary("Summary: notes BEFORE mapping (invalid/skipped)", preInvalid.sorted, 10);
    printTopSummary("Summary: notes AFTER mapping (invalid/skipped)", postInvalid.sorted, 10);
}

if (require.main === module) {
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
}
