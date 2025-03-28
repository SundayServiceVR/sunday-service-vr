import { signOut } from "firebase/auth";
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Outlet } from "react-router";
import { auth } from "../../util/firebase";

import { confirm } from "../../components/confirm";

const Layout = () => {
    return <>
        <Navbar expand="lg" collapseOnSelect className="bg-body-secondary" data-bs-theme="dark">
            <Container>
                <Navbar.Brand><Nav.Link href="/">Sunday Service</Nav.Link></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse className="justify-content-end">
                    <Nav className="me-auto">
                        <Nav.Link href="/events">
                            Events
                        </Nav.Link>
                        <Nav.Link href="/djs">
                            Dj Roster
                        </Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link
                            onClick={
                                () => confirm({
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
                                })
                                }>
                            Logout
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <Container className="mt-1">
            <Outlet />
        </Container>
    </>
}
export default Layout;