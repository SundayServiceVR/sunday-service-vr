import { signOut } from "firebase/auth";
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Outlet } from "react-router";
import { auth } from "../../util/firebase";

import { confirm } from "../../components/confirm";

const Layout = () => {
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
                </Nav>
            </Navbar.Collapse>
        </Navbar>
        <Container className="mt-1">
            <Outlet />
        </Container> 
    </>
}
export default Layout;