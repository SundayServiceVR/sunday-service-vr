// Minimal mock for DocumentReference for tests
export type MockDocumentReference = { id: string };
export const mockDocRef = (id: string = "mock-id"): MockDocumentReference => ({ id });
