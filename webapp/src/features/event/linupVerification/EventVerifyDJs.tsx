// Deprecated: verification flow moved into the Lineup UI modal.
// Keeping this file as a no-op placeholder to avoid accidental imports during transition.
import { useEffect } from "react";

const EventVerifyDJs = () => {
    useEffect(() => {
        // Warn if this deprecated component is ever rendered.
        // eslint-disable-next-line no-console
        console.warn("EventVerifyDJs is deprecated — use the Verify Lineup modal in EventLineup instead.");
    }, []);

    return null;
};

export default EventVerifyDJs;