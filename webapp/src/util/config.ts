// Single source of truth for hosts, ports and project IDs.
// Override with VITE_* env vars (e.g. for ephemeral `demo-*` projects).
const env = import.meta.env;

export const isEmulator: boolean =
  env.VITE_USE_EMULATORS !== undefined
    ? env.VITE_USE_EMULATORS === "true"
    : env.MODE === "development";

export const projectId: string = env.VITE_FIREBASE_PROJECT_ID ?? "sunday-service-vr";
export const functionsRegion = "us-central1";

export const emulatorHost: string = env.VITE_EMULATOR_HOST ?? "127.0.0.1";
export const emulatorPorts = {
  functions: Number(env.VITE_EMULATOR_FUNCTIONS_PORT ?? 5001),
  firestore: Number(env.VITE_EMULATOR_FIRESTORE_PORT ?? 8080),
  auth: Number(env.VITE_EMULATOR_AUTH_PORT ?? 9099),
  storage: Number(env.VITE_EMULATOR_STORAGE_PORT ?? 9199),
};

export const enableDirectLogin: boolean = env.VITE_ENABLE_DIRECT_LOGIN === "true";

/** URL of a Cloud Function; `prodUrl` is used outside emulator mode. */
export const functionUrl = (name: string, prodUrl: string): string =>
  isEmulator
    ? `http://${emulatorHost}:${emulatorPorts.functions}/${projectId}/${functionsRegion}/${name}`
    : prodUrl;
