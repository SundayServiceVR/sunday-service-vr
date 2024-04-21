import { signOut } from "firebase/auth";
import { Container, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { Outlet } from "react-router";
import { auth } from "../../util/firebase";

const Layout = () => {
    const onSignOutClicked = () => {
        signOut(auth);
    };

    return <>
        <Navbar expand="lg" className="bg-body-secondary" data-bs-theme="dark">
            <Navbar.Brand className="px-3">Sunday Service</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse className="justify-content-end">
                <Nav className="me-auto mx-3">
                    <Nav.Link href="/">
                        Home
                    </Nav.Link>
                    <NavDropdown title="Next Event">
                        <NavDropdown.Item href="/event/setup">
                            Setup
                        </NavDropdown.Item>
                        <NavDropdown.Item href="/event/lineup">
                            Lineup
                        </NavDropdown.Item>
                        <NavDropdown.Item href="/event/announcements">
                            Announcements
                        </NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link onClick={onSignOutClicked}>
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