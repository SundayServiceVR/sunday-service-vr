
/**
 * Does the thing
 *
 * @param {FirebaseFirestore.CollectionReference} db
 * @param {string} collectionName
 * @return {Promise<T[]>}
 */
export async function fetchCollection(db: FirebaseFirestore.Firestore, collectionName: string) {
    const collection = db.collection(collectionName);
    const snapshot = await collection.get();
    return snapshot.docs.map((doc) => (doc.data()));
}
