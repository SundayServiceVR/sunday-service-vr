import { useState } from "react";
import { Button, Form, Modal, Tab, Tabs } from "react-bootstrap";
import { FileText } from "react-feather";
import toast from "react-hot-toast";
import { useAutosavePreference } from "../../../hooks/useAutosave/useAutosavePreference";
import { confirm } from "../../../components/confirm";
import { useEventOperations } from "../outletContext";
import DiscordIcon from "./DiscordIcon";
import { MessageSendConfig } from "./messageConfigs";

type Props = {
    config: MessageSendConfig;
    variant?: string;
    size?: "sm" | "lg";
};

/**
 * The single entry point for composing a message and sending it somewhere:
 * one button opens a modal where the message is edited, saved, copied, and
 * the destination is opened in a new window.
 */
const MessageSendButton = ({ config, variant = "outline-primary", size = "sm" }: Props) => {
    const [event, proposeEventChange, , controls] = useEventOperations();
    const [autosaveEnabled] = useAutosavePreference();
    const [show, setShow] = useState(false);
    const [draft, setDraft] = useState("");
    const [busy, setBusy] = useState(false);

    const storedMessage = config.getMessage(event);
    const isDirty = draft !== storedMessage;

    const openModal = () => {
        setDraft(config.getMessage(event));
        setShow(true);
    };

    const open = () => {
        if (!controls.hasChanges) {
            openModal();
            return;
        }
        confirm({
            title: "Unsaved changes",
            message: "You have unsaved changes. Save them before continuing?",
            confirmButton: {
                text: "Save",
                action: async () => {
                    try {
                        await controls.save();
                        openModal();
                    } catch (error) {
                        toast.error(`Error saving event: ${(error as Error).message}`);
                    }
                },
            },
            cancelButton: { text: "Cancel" },
        });
    };

    const close = () => setShow(false);

    const onChange = (value: string) => {
        setDraft(value);
        if (autosaveEnabled) {
            proposeEventChange(config.applyMessage(event, value));
        }
    };

    const save = async () => {
        setBusy(true);
        try {
            await controls.saveWith(config.applyMessage(event, draft));
            toast.success("Message saved!");
        } catch (error) {
            toast.error(`Error saving message: ${(error as Error).message}`);
        } finally {
            setBusy(false);
        }
    };

    const saveAndSend = async () => {
        setBusy(true);
        try {
            const updated = config.applyMessage(event, draft);
            if (isDirty || controls.hasChanges) {
                await controls.saveWith(updated);
            }
            await navigator.clipboard.writeText(config.getOutput ? config.getOutput(updated) : draft);
            toast.success("Message copied to clipboard!");
            window.open(config.url, "_blank", "noopener,noreferrer");
            setShow(false);
        } catch (error) {
            toast.error(`Error sending message: ${(error as Error).message}`);
        } finally {
            setBusy(false);
        }
    };

    const preview = config.getOutput ? config.getOutput(config.applyMessage(event, draft)) : null;

    return <>
        <Button variant={variant} size={size} onClick={open} className="d-inline-flex align-items-center gap-2">
            {config.destination === "discord" ? <DiscordIcon /> : <FileText size={16} />}
            {config.buttonLabel}
        </Button>

        <Modal show={show} onHide={close} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{config.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey="edit" className="mb-3">
                    <Tab eventKey="edit" title="Edit Message">
                        <Form.Group>
                            <Form.Label>{config.label}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={12}
                                value={draft}
                                onChange={(e) => onChange(e.target.value)}
                                className="has-fixed-size"
                            />
                            <Form.Text className="text-muted">
                                {config.helpText}
                                {autosaveEnabled ? " Changes are saved automatically." : ""}
                            </Form.Text>
                        </Form.Group>
                    </Tab>
                    {preview !== null && (
                        <Tab eventKey="preview" title="Preview">
                            <Form.Control as="textarea" value={preview} rows={16} readOnly className="has-fixed-size" />
                        </Tab>
                    )}
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={close} disabled={busy}>
                    {autosaveEnabled ? "Close" : "Cancel"}
                </Button>
                {!autosaveEnabled && (
                    <Button variant="success" onClick={save} disabled={busy || !isDirty}>
                        Save
                    </Button>
                )}
                <Button variant="primary" onClick={saveAndSend} disabled={busy}>
                    Copy and Send
                </Button>
            </Modal.Footer>
        </Modal>
    </>;
};

export default MessageSendButton;
