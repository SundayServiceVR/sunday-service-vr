export const PROJECT_ID = process.env.GCLOUD_PROJECT ?? "sunday-service-vr";
export const HOST = "127.0.0.1";

export const PORTS = {
  functions: 5001,
  firestore: 8080,
  auth: 9099,
  mockGithub: Number(process.env.MOCK_GITHUB_PORT ?? 4600),
};

export const WEBAPP_URL = process.env.WEBAPP_URL ?? "http://localhost:3000";
export const MOCK_GITHUB_URL = `http://${HOST}:${PORTS.mockGithub}`;

export const functionUrl = (name: string) =>
  `http://${HOST}:${PORTS.functions}/${PROJECT_ID}/us-central1/${name}`;

// Must be set before firebase-admin is used.
process.env.FIRESTORE_EMULATOR_HOST = `${HOST}:${PORTS.firestore}`;
process.env.FIREBASE_AUTH_EMULATOR_HOST = `${HOST}:${PORTS.auth}`;
process.env.GCLOUD_PROJECT = PROJECT_ID;
