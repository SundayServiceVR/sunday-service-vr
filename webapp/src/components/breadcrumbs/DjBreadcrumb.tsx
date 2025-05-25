import { useEffect, useState } from "react";
import { Dj } from "../../util/types";
import { useEventDjCache } from "../../contexts/useEventDjCache";
import { RouteMatch } from "react-router";

type Props = {
  match: RouteMatch;
}
const DjBreadcrumb = ({match}: Props) => {

  const { djCache } = useEventDjCache();
  const [ dj, setDj ] = useState<Dj>();

  const djId = match.params.djId;

  useEffect(() => {
    if (!djId) return;

    (async () => {
      // Attempt to fetch the event from the cache
      const cachedDj = await djCache.get(djId);
      if (cachedDj) {
        setDj(cachedDj);
      } else {
        console.error(`Dj with ID ${djId} not found in cache.`);
      }
    }
    )();
    // If the eventId changes, we need to fetch the new event
  }, [djCache, djId]); 

  return <span>{dj ? `${dj?.public_name}` : djId}</span>;  
}

export default DjBreadcrumb;