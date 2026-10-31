import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "autosaveEventChanges";
// Same-tab change notification (the native "storage" event only fires in other tabs).
const CHANGE_EVENT = "autosave-preference-changed";

const getSnapshot = (): boolean => {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
        return false;
    }
};

const subscribe = (listener: () => void) => {
    window.addEventListener("storage", listener);
    window.addEventListener(CHANGE_EVENT, listener);
    return () => {
        window.removeEventListener("storage", listener);
        window.removeEventListener(CHANGE_EVENT, listener);
    };
};

/**
 * Per-browser opt-in for autosaving event changes. Off by default.
 * Backed by localStorage and shared by every component that calls it, so the
 * toggle (user menu) and the consumer (event editor) stay in sync.
 */
export const useAutosavePreference = (): [boolean, (enabled: boolean) => void] => {
    const enabled = useSyncExternalStore(subscribe, getSnapshot);

    const setEnabled = useCallback((value: boolean) => {
        try {
            localStorage.setItem(STORAGE_KEY, String(value));
        } catch {
            // Storage unavailable: the preference can't be saved.
            return;
        }
        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, []);

    return [enabled, setEnabled];
};
