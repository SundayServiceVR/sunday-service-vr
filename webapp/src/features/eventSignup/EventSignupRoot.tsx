import { Outlet, useParams } from "react-router";
import { auth } from "../../util/firebase";
import { useEffect, useState } from "react";
import { Dj, Event } from "../../util/types";
import Spinner from "../../components/spinner/Spinner";
import { docToEventRaw } from "../../store/converters";

export const EventSignupRoot = () => {

  const [dj, setDj] = useState<Dj>();
  const [event, setEvent] = useState<Event>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { eventId } = useParams<{ eventId?: string }>();

  useEffect(() => {
    if(!eventId) {
      setError("No event ID provided.");
      return;
    }
    setLoading(true);
    (async () => {

      const origin = process.env.NODE_ENV === "development"
        ? "http://localhost:5001"
        : window.location.origin;

      const endpoint = "/sunday-service-vr/us-central1/eventSignupGetEventAndDj"
      const url = new URL(endpoint, origin);
      url.searchParams.set("event_id", eventId);

      const idToken = await auth.currentUser?.getIdToken();
      try {
        const response = await fetch(
          url.toString(),
          {
            method: "GET",
            headers: {
              ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
        });
        console.log(`Response status: ${response.status}`);
        const responseJson = await response.json();

        setEvent(docToEventRaw(responseJson.event));
        setDj(responseJson.dj);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error fetching event and DJ:", errorMessage);
        setError(`Error fetching event and DJ: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  if (loading) {
    return <Spinner type="logo" />;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!event || !dj) {
    return <div>Event or DJ data not found.</div>;
  }



  return <>
    <Outlet context={{event, dj}} />
  </>
}