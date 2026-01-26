export type SchemaNode =
    | { kind: "string"; optional?: boolean }
    | { kind: "number"; optional?: boolean }
    | { kind: "boolean"; optional?: boolean }
    | { kind: "date"; optional?: boolean }
    | { kind: "array"; optional?: boolean; element: SchemaNode }
    | { kind: "object"; optional?: boolean; fields: Record<string, SchemaNode> }
    | { kind: "any"; optional?: boolean };

export type FieldDiff =
    | { path: string; type: "missing"; expected: string }
    | { path: string; type: "extra"; actual: string }
    | { path: string; type: "type"; expected: string; actual: string }
    | { path: string; type: "invalid"; message: string };

export type DiffOptions = {
    /**
     * List of path prefixes to ignore (e.g. ["reconciled", "slots[0].reconciled"]).
     * If a diff path starts with any prefix, it is skipped.
     */
    ignorePathPrefixes?: string[];
};

const s = {
    string: (optional = false): SchemaNode => ({ kind: "string", optional }),
    number: (optional = false): SchemaNode => ({ kind: "number", optional }),
    boolean: (optional = false): SchemaNode => ({ kind: "boolean", optional }),
    date: (optional = false): SchemaNode => ({ kind: "date", optional }),
    any: (optional = false): SchemaNode => ({ kind: "any", optional }),
    array: (element: SchemaNode, optional = false): SchemaNode => ({ kind: "array", element, optional }),
    object: (fields: Record<string, SchemaNode>, optional = false): SchemaNode => ({ kind: "object", fields, optional }),
};

export function buildEventSchema(): SchemaNode {
    return s.object({
        id: s.string(true),
        name: s.string(),
        published: s.boolean(),
        message: s.string(),
        socialMediaMessage: s.string(true),
        start_datetime: s.date(),
        end_datetime: s.date(true),
        host: s.string(),
        host_ref: s.any(true),
        slots: s.array(
            s.object({
                signup_uuid: s.string(true),
                stream_source_type: s.string(true),
                stream_source_url: s.string(true),
                start_time: s.date(),
                reconciled: s.object({
                    signup: s.object({
                        uuid: s.string(),
                        name: s.string(),
                        requested_duration: s.number(),
                        type: s.string(),
                        dj_refs: s.array(s.any()),
                        is_debut: s.boolean(),
                        event_signup_form_data: s.object(
                            {
                                event_id: s.string(),
                                name: s.string(true),
                                requested_duration: s.number(true),
                                type: s.string(true),
                                is_b2b: s.boolean(true),
                                b2b_members_response: s.string(true),
                                available_from: s.any(true),
                                available_to: s.any(true),
                                stream_link: s.string(true),
                                confirm_expectations: s.boolean(true),
                                dj_notes: s.string(true),
                            },
                            true
                        ),
                    }),
                }),
                djs: s.array(
                    s.object({
                        dj_name: s.string(true),
                        discord_id: s.string(true),
                    }),
                    true
                ),
                duration: s.number(),
                is_live: s.boolean(true),
                dj_ref: s.any(),
                prerecord_url: s.string(true),
                slot_type: s.string(true),
                is_debut: s.boolean(true),
                discord_id: s.string(true),
                dj_name: s.string(true),
                rtmp_url: s.string(true),
                twitch_username: s.string(true),
            })
        ),
        footer: s.string(),
        signupsAreOpen: s.boolean(true),
        signups: s.array(
            s.object({
                uuid: s.string(),
                name: s.string(),
                requested_duration: s.number(),
                type: s.string(),
                dj_refs: s.array(s.any()),
                is_debut: s.boolean(),
                event_signup_form_data: s.object(
                    {
                        event_id: s.string(),
                        name: s.string(true),
                        requested_duration: s.number(true),
                        type: s.string(true),
                        is_b2b: s.boolean(true),
                        b2b_members_response: s.string(true),
                        available_from: s.any(true),
                        available_to: s.any(true),
                        stream_link: s.string(true),
                        confirm_expectations: s.boolean(true),
                        dj_notes: s.string(true),
                    },
                    true
                ),
            })
        ),
        dj_plays: s.array(s.any()),
        reconciled: s.object(
            {
                host: s.object(
                    {
                        id: s.string(true),
                        host_name: s.string(),
                        host_poster_path: s.string(true),
                        host_poster_url: s.string(true),
                        dj_ref: s.any(true),
                    },
                    true
                ),
            },
            true
        ),
        lastUpdated: s.date(true),
        lineup_poster_path: s.string(true),
        lineup_poster_url: s.string(true),
        signup_configuration: s.object(
            {
                isLiveJive: s.boolean(true),
            },
            true
        ),
    });
}

export function diffAgainstSchema(value: unknown, schema: SchemaNode, path = "", options: DiffOptions = {}): FieldDiff[] {
    const diffs: FieldDiff[] = [];

    const ignorePrefixes = options.ignorePathPrefixes ?? [];
    const shouldIgnore = (p: string) => {
        const pp = p || "<root>";
        return ignorePrefixes.some((prefix) => pp === prefix || pp.startsWith(prefix + ".") || pp.startsWith(prefix + "["));
    };

    if (shouldIgnore(path || "<root>")) {
        return diffs;
    }

    if (value === undefined || value === null) {
        diffs.push({ path: path || "<root>", type: "missing", expected: describeSchema(schema) });
        return diffs;
    }

    switch (schema.kind) {
        case "any":
            return diffs;
        case "string":
        case "number":
        case "boolean":
            if (typeof value !== schema.kind) {
                diffs.push({
                    path: path || "<root>",
                    type: "type",
                    expected: schema.kind,
                    actual: typeof value,
                });
            }
            return diffs;
        case "date": {
            if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
                diffs.push({
                    path: path || "<root>",
                    type: "type",
                    expected: "Date",
                    actual: getValueType(value),
                });
            }
            return diffs;
        }
        case "array": {
            if (!Array.isArray(value)) {
                diffs.push({
                    path: path || "<root>",
                    type: "type",
                    expected: "array",
                    actual: getValueType(value),
                });
                return diffs;
            }

            const limit = Math.min(value.length, 3);
            for (let i = 0; i < limit; i++) {
                diffs.push(...diffAgainstSchema(value[i], schema.element, `${path}[${i}]`, options));
            }
            if (value.length > limit) {
                diffs.push({
                    path: `${path}[${limit}..${value.length - 1}]`,
                    type: "invalid",
                    message: `skipped ${value.length - limit} additional array elements`,
                });
            }

            return diffs;
        }
        case "object": {
            if (typeof value !== "object" || Array.isArray(value)) {
                diffs.push({
                    path: path || "<root>",
                    type: "type",
                    expected: "object",
                    actual: getValueType(value),
                });
                return diffs;
            }

            const obj = value as Record<string, unknown>;

            for (const [key, fieldSchema] of Object.entries(schema.fields)) {
                const currentPath = path ? `${path}.${key}` : key;
                const currentValue = obj[key];

                if (currentValue === undefined) {
                    if (!fieldSchema.optional) {
                        if (!shouldIgnore(currentPath)) {
                            diffs.push({
                            path: currentPath,
                            type: "missing",
                            expected: describeSchema(fieldSchema),
                            });
                        }
                    }
                    continue;
                }

                diffs.push(...diffAgainstSchema(currentValue, fieldSchema, currentPath, options));
            }

            const allowed = new Set(Object.keys(schema.fields));
            for (const key of Object.keys(obj)) {
                if (!allowed.has(key)) {
                    const currentPath = path ? `${path}.${key}` : key;
                    if (!shouldIgnore(currentPath)) {
                        diffs.push({ path: currentPath, type: "extra", actual: getValueType(obj[key]) });
                    }
                }
            }

            return diffs;
        }
    }
}

export function formatDiffReport(docId: string, diffs: FieldDiff[]): string {
    const lines = diffs
        .slice(0, 80)
        .map((d) => {
            switch (d.type) {
                case "missing":
                    return `  - missing: ${d.path} (expected ${d.expected})`;
                case "extra":
                    return `  - extra:   ${d.path} (actual ${d.actual})`;
                case "type":
                    return `  - type:    ${d.path} (expected ${d.expected}, actual ${d.actual})`;
                case "invalid":
                    return `  - note:    ${d.path} (${d.message})`;
            }
        });

    const truncated = diffs.length > 80 ? `\n  ...and ${diffs.length - 80} more` : "";
    return `\n[${docId}] ⚠️ schema mismatch\n${lines.join("\n")}${truncated}`;
}

function getValueType(value: unknown): string {
    if (value === null) {
        return "null";
    }
    if (value instanceof Date) {
        return "Date";
    }
    if (Array.isArray(value)) {
        return "array";
    }
    return typeof value;
}

function describeSchema(schema: SchemaNode): string {
    switch (schema.kind) {
        case "any":
            return "any";
        case "string":
        case "number":
        case "boolean":
            return schema.kind;
        case "date":
            return "Date";
        case "array":
            return `array<${describeSchema(schema.element)}>`;
        case "object":
            return "object";
    }
}
