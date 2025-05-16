import { signOut } from "firebase/auth";
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Outlet } from "react-router";
import { auth } from "../../util/firebase";
import { useEffect, useState } from "react";

import { confirm } from "../../components/confirm";

const Layout = () => {
    const [userId, setUserId] = useState("");

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setUserId(user.email || user.uid);
        }
    }, []);

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
                    <Nav.Item className="dropdown">

                        <NavDropdown title={userId || "User"} id="nav-dropdown">
                            {/* <NavDropdown.Item>Edit Profile</NavDropdown.Item>
                            <NavDropdown.Divider /> */}
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