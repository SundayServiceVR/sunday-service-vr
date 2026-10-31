import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error" | "paused";

type Options = {
    enabled: boolean;
    isDirty: boolean;
    /** False when the current content must not be persisted yet (e.g. invalid). */
    canSave: boolean;
    /** Changes on every edit so the debounce window restarts. */
    version: unknown;
    /** Persists the current content. Must throw on failure. */
    save: () => Promise<void>;
    delayMs: number;
};

/**
 * Debounced autosave. Knows nothing about events: it only decides *when* to
 * call `save`, and reports status. Saves never overlap; an edit that lands
 * during a save is picked up by a follow-up save.
 */
export const useAutosave = ({ enabled, isDirty, canSave, version, save, delayMs }: Options) => {
    const [status, setStatus] = useState<AutosaveStatus>("idle");

    const saveRef = useRef(save);
    saveRef.current = save;
    const latest = useRef({ enabled, isDirty, canSave });
    latest.current = { enabled, isDirty, canSave };

    const inFlight = useRef(false);
    const rerun = useRef(false);
    const mounted = useRef(true);

    const run = useCallback(async () => {
        if (inFlight.current) {
            rerun.current = true;
            return;
        }
        inFlight.current = true;
        if (mounted.current) setStatus("saving");
        try {
            await saveRef.current();
            if (mounted.current) setStatus("saved");
        } catch {
            if (mounted.current) setStatus("error");
        } finally {
            inFlight.current = false;
            if (rerun.current) {
                rerun.current = false;
                if (latest.current.isDirty) void run();
            }
        }
    }, []);

    /** Save now if there is anything pending (used on blur and unmount). */
    const flush = useCallback(() => {
        const { enabled, isDirty, canSave } = latest.current;
        if (enabled && isDirty && canSave) void run();
    }, [run]);

    useEffect(() => {
        if (!enabled || !isDirty) return;
        if (!canSave) {
            setStatus("paused");
            return;
        }
        setStatus("pending");
        const timer = setTimeout(() => void run(), delayMs);
        return () => clearTimeout(timer);
    }, [enabled, isDirty, canSave, version, delayMs, run]);

    useEffect(() => {
        if (!enabled) setStatus("idle");
    }, [enabled]);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            const { enabled, isDirty, canSave } = latest.current;
            if (enabled && isDirty && canSave) void saveRef.current().catch(() => undefined);
        };
    }, []);

    return { status, flush, retry: run };
};
