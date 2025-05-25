import { signOut } from "firebase/auth";
import { NavDropdown, Nav } from 'react-bootstrap';
import { confirm } from "../../components/confirm";
import { useContext } from "react";
import { FirebaseAuthContext } from "../../contexts/FirebaseAuthContext";

const UserDropdown = () => {
    const { roles, auth } = useContext(FirebaseAuthContext);

    if (!auth || !auth.currentUser) {
        return null; // or handle unauthenticated state
    }

    return (
        <Nav.Item className="dropdown d-flex align-items-center">
            <NavDropdown title={auth.currentUser?.displayName}>
                {roles?.map((role) => (
                    <NavDropdown.Item key={role}>
                        {role}
                    </NavDropdown.Item>
                ))}
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