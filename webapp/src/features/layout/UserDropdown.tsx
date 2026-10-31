import { signOut } from "firebase/auth";
import { NavDropdown, Nav, Badge, Form } from 'react-bootstrap';
import { confirm } from "../../components/confirm";
import { useContext } from "react";
import { FirebaseAuthContext } from "../../contexts/FirebaseAuthContext";
import { Link } from 'react-router-dom';
import { useAutosavePreference } from "../../hooks/useAutosave/useAutosavePreference";

type Props = {
    onShowRoleModal?: () => void;
}

const UserDropdown = ({ onShowRoleModal }: Props) => {
    const { auth, isSimulatingRoles, actualRoles } = useContext(FirebaseAuthContext);
    const [autosaveEnabled, setAutosaveEnabled] = useAutosavePreference();

    if (!auth || !auth.currentUser) {
        return null; // or handle unauthenticated state
    }

    return (
        <Nav.Item className="dropdown d-flex align-items-center">
            <NavDropdown title={
                <span>
                    {auth.currentUser?.displayName}
                    {isSimulatingRoles && (
                        <Badge bg="warning" className="ms-1">SIM</Badge>
                    )}
                </span>
            }>
                <NavDropdown.Item as="span">
                    <Link to="/userInfo" className="nav-link p-0">
                        My User Info
                    </Link>
                </NavDropdown.Item>

                <NavDropdown.Divider />
                <div className="px-3 py-1">
                    <Form.Check
                        type="switch"
                        id="autosave-toggle"
                        data-testid="autosave-toggle"
                        label="Autosave (event only)"
                        checked={autosaveEnabled}
                        onChange={(e) => setAutosaveEnabled(e.target.checked)}
                    />
                </div>
                
                {/* Role Simulation option - only show when not actively simulating */}
                {actualRoles?.includes('developer') && !isSimulatingRoles && (
                    <>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={onShowRoleModal}>
                            🎭 Role Simulation
                        </NavDropdown.Item>
                    </>
                )}
                
                <NavDropdown.Divider />
                <NavDropdown.Item>
                    <Nav.Link onClick={() => confirm({
                        title: "Are You sure?",
                        message: "You are about to logout",
                        confirmButton: {
                            text: "Yes",
                            action: () => {
                                signOut(auth);
                            }
                        },
                        cancelButton: {
                            text: "Cancel"
                        }
                    })}>
                        Logout
                    </Nav.Link>
                </NavDropdown.Item>
            </NavDropdown>
        </Nav.Item>
    );
};

export default UserDropdown;