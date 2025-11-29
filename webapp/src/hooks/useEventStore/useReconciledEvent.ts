import { useMemo } from "react";
import { Event } from "../../util/types";
import { DjCache } from "../../contexts/useEventDjCache/types";
import { reconcileEventData } from "./eventReconciliation";

export function useReconciledEvent(event: Event, djCache: DjCache): Event {
  return useMemo(() => reconcileEventData(event, djCache), [event, djCache]);
}
