import { signOut } from "firebase/auth";
import { Alert, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Outlet } from "react-router";
import { useContext } from "react";

import { confirm } from "../../components/confirm";
import { FirebaseAuthContext } from "../../contexts/FirebaseAuthContext";
import UserAvatarName from "../../components/userAvatarName";

const Layout = () => {

    const { roles, auth } = useContext(FirebaseAuthContext);

    if(!auth) {
        return <Alert variant="danger" className="text-center">
            <Alert.Heading>Authentication Error</Alert.Heading>
            <p>
                You are not authenticated. Please log in to access this page.
            </p>
        </Alert>
    }

    return <>
        <Navbar expand="lg" className="bg-body-secondary px-3" data-bs-theme="dark">
            <Navbar.Brand className="px-3">Sunday Service</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse className="justify-content-end">
                <Nav className="me-auto mx-3">
                    <Nav.Link href="/">
                        Home
                    </Nav.Link>
                    <Nav.Link href="/events">
                        Events
                    </Nav.Link>
                    <Nav.Link href="/djs">
                        Dj Roster
                    </Nav.Link>
                    <Nav.Link href="/globalSettings">
                        Global Settings
                    </Nav.Link>
                </Nav>
                <Nav className="ms-auto mx-3">
                    <Nav.Item className="p-0">
                        <UserAvatarName displayName={""} photoURL={auth.currentUser?.photoURL} />
                    </Nav.Item>
                    <Nav.Item className="dropdown d-flex align-items-center">
                        <NavDropdown title={auth.currentUser?.displayName}>
                            { roles?.map((role) => (
                                <NavDropdown.Item key={role}>
                                    {role}
                                </NavDropdown.Item>
                            ))}
                            {/* <NavDropdown.Divider /> */}
                            {/* <NavDropdown.Item>Edit Profile</NavDropdown.Item> */}
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
                </Nav>
            </Navbar.Collapse>
        </Navbar>
        <Container className="mt-1">
            <Outlet />
        </Container>
    </>
}
export default Layout;