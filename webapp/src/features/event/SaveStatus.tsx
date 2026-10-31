import { Button, Spinner } from "react-bootstrap";
import { AutosaveStatus } from "../../hooks/useAutosave/useAutosave";

type Props = {
    status: AutosaveStatus;
    onRetry: () => void;
};

type Appearance = { label: string; tone: "secondary" | "success" | "danger" | "warning"; icon: "spinner" | string };

// A queued save is shown as "Saving" so the user never thinks they have to act.
const appearance: Record<AutosaveStatus, Appearance> = {
    idle: { label: "", tone: "secondary", icon: "" },
    pending: { label: "Saving…", tone: "secondary", icon: "spinner" },
    saving: { label: "Saving…", tone: "secondary", icon: "spinner" },
    saved: { label: "Saved", tone: "success", icon: "✓" },
    error: { label: "Couldn't save your changes", tone: "danger", icon: "✕" },
    paused: { label: "Autosave paused: event name is required", tone: "warning", icon: "!" },
};

/** Persistent indicator of the autosave state, colored by meaning. */
const SaveStatus = ({ status, onRetry }: Props) => {
    const { label, tone, icon } = appearance[status];
    return (
        <div
            data-testid="save-status"
            data-status={status}
            role="status"
            className={`d-flex align-items-center justify-content-end gap-2 text-${tone}`}
        >
            {icon === "spinner"
                ? <Spinner animation="border" size="sm" aria-hidden="true" />
                : icon && <span aria-hidden="true" className="fw-bold">{icon}</span>}
            <span>{label}</span>
            {status === "error" && <Button variant="outline-danger" size="sm" onClick={onRetry}>Retry</Button>}
        </div>
    );
};

export default SaveStatus;
