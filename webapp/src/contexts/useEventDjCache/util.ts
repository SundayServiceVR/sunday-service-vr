import { query, collection, getDocs } from "firebase/firestore";
import { db } from "../../util/firebase";
import { Dj } from "../../util/types";

export const getDjCache = async () => {
      const q = query(collection(db, "djs"));
      const querySnapshot = await getDocs(q);
  
      const djs = querySnapshot.docs.map(doc => ({ id: doc.id, dj: doc.data() as Dj }));
      const djCache = new Map<string, Dj>();
      djs.forEach(dj => djCache.set(dj.id, dj.dj));
      return djCache;
}