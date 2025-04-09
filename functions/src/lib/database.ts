import { DocumentData, DocumentReference, DocumentSnapshot, Firestore } from "firebase-admin/firestore";

/**
 * Does the thing
 *
 * @param {CollectionReference} db
 * @param {string} collectionName
 * @return {Promise<T[]>}
 */
export async function fetchCollection(db: Firestore, collectionName: string) {
    const collection = db.collection(collectionName);
    const snapshot = await collection.get();
    return snapshot.docs.map((doc) => (doc.data()));
}

/**
 * Fetches a map of DJs from Firestore based on an array of DocumentReferences.
 *
 * @param {DocumentReference[]} djRefs - Array of DocumentReferences for DJs.
 * @return {Promise<Map<string, DocumentData>>} - A map of DJ IDs to their data.
 */
export async function fetchDjsMap(
    djRefs: DocumentReference[]
): Promise<Map<string, DocumentData | undefined>> {
    const djMap = new Map<string, DocumentData | undefined>();

    // Fetch all DJs in parallel
    const djSnapshots = await Promise.all(djRefs.map((ref) => ref.get()));

    // Populate the map with DJ data
    djSnapshots.forEach((snapshot: DocumentSnapshot) => {
        if (snapshot.exists) {
            const data = snapshot.data();
            djMap.set(snapshot.id, data);
        }
    });

    return djMap;
}
