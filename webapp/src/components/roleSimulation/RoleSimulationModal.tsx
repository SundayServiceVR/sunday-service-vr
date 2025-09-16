import { Button, Form, Modal, Alert } from "react-bootstrap";
import { useState } from "react";

type Props = {
    show: boolean;
    handleClose: () => void;
    currentSimulatedRoles: string[];
    onRoleSimulationChange: (roles: string[]) => void;
}

const availableRoles = [
    { value: 'admin', label: 'Admin' },
    { value: 'host', label: 'Host' },
    { value: 'dj', label: 'DJ' },
    { value: 'developer', label: 'Developer' }
];

export const RoleSimulationModal = ({ show, handleClose, currentSimulatedRoles, onRoleSimulationChange }: Props) => {
    const [selectedRoles, setSelectedRoles] = useState<string[]>(currentSimulatedRoles);

    const handleRoleToggle = (role: string) => {
        setSelectedRoles(prev => 
            prev.includes(role) 
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const handleSave = () => {
        onRoleSimulationChange(selectedRoles);
        handleClose();
    };

    const handleReset = () => {
        setSelectedRoles(['admin', 'host', 'dj', 'developer']); // Default developer roles
    };

    const handleClearSimulation = () => {
        setSelectedRoles(['admin', 'host', 'dj', 'developer']); // This will trigger clearing simulation
        onRoleSimulationChange(['admin', 'host', 'dj', 'developer']);
        handleClose();
    };

    const handleCancel = () => {
        setSelectedRoles(currentSimulatedRoles); // Reset to current state
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleCancel}>
            <Modal.Header closeButton>
                <Modal.Title>Simulate Roles (Developer Mode)</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant="warning" className="mb-3">
                    <strong>Developer Feature:</strong> This allows you to simulate having different roles to test the application. Changes will persist until you reset or log out.
                </Alert>
                <p className="text-muted mb-3">
                    Select which roles you want to simulate. This will affect what content you can access in the application.
                </p>
                <Form>
                    {availableRoles.map((role) => (
                        <Form.Check
                            key={role.value}
                            type="checkbox"
                            id={`role-${role.value}`}
                            label={role.label}
                            checked={selectedRoles.includes(role.value)}
                            onChange={() => handleRoleToggle(role.value)}
                            className="mb-2"
                        />
                    ))}
                </Form>
                {selectedRoles.length === 0 && (
                    <Alert variant="danger" className="mt-3">
                        Warning: Selecting no roles may prevent you from accessing any content.
                    </Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={handleClearSimulation}>
                    Clear Simulation
                </Button>
                <Button variant="outline-secondary" onClick={handleReset}>
                    Reset to All Roles
                </Button>
                <Button variant="secondary" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Apply Simulation
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RoleSimulationModal;