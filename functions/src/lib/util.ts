/**
 * Compares two lists of Firestore documents to determine if they contain the same elements.
 *
 * @param oneListOfDocs - The first list of Firestore documents to compare.
 * @param anotherListOfDocs - The second list of Firestore documents to compare.
 * @returns A boolean indicating whether the two lists contain the same elements.
 */
import { DocumentData } from "firebase-admin/firestore";

export const listOfDocsMatch = (oneListOfDocs: DocumentData[], anotherListOfDocs: DocumentData[]) => {
    const oneSetOfEvents = new Set(oneListOfDocs);
    const anotherSetOfEvents = new Set(anotherListOfDocs);

    return oneSetOfEvents.size === anotherSetOfEvents.size &&
  [...oneSetOfEvents].every((x) => anotherSetOfEvents.has(x));
};
