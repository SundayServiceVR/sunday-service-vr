import { Container, Nav, Navbar } from 'react-bootstrap';
import { Outlet } from "react-router";
import { useContext } from "react";
import { FirebaseAuthContext } from "../../contexts/FirebaseAuthContext";
import UserAvatarName from "../../components/userAvatarName";
import { confirm } from "../../components/confirm";
import AuthErrorAlert from "./AuthErrorAlert";
import BreadcrumbsBar from "./BreadcrumbsBar";
import UserDropdown from "./UserDropdown";
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';

const Layout = () => {
    const { auth, roles } = useContext(FirebaseAuthContext);

    if (!auth) {
        return <AuthErrorAlert />;
    }
    return <>
        <Navbar expand="lg" className="bg-body-secondary px-3" data-bs-theme="dark">
            <Navbar.Brand className="px-3">Sunday Service</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse className="justify-content-end">
                <Nav className="me-auto mx-3">
                    <Nav.Item className="d-lg-none">
                        <span className="ms-2 text-white">
                            {auth.currentUser?.displayName}
                        </span>
                    </Nav.Item>

                    {(roles?.includes('host') || roles?.includes('admin')) && (
                        <>
                            <Nav.Link as="span">
                                <Link to="/" className="nav-link p-0">
                                    Home
                                </Link>
                            </Nav.Link>
                            <Nav.Link as="span">
                                <Link to="/events" className="nav-link p-0">
                                    Events
                                </Link>
                            </Nav.Link>
                            <Nav.Link as="span">
                                <Link to="/djs" className="nav-link p-0">
                                    Dj Roster
                                </Link>
                            </Nav.Link>
                            <Nav.Link as="span">
                                <Link to="/bingo" className="nav-link p-0">
                                    Bingo
                                </Link>
                            </Nav.Link>
                        </>
                    )}
                    <Nav.Link as="span" className="d-lg-none">
                        <Link to="/userInfo" className="nav-link p-0">
                            User Info
                        </Link>
                    </Nav.Link>
                    <Nav.Link as="span" className="d-lg-none">
                        <Link to="/bingo" className="nav-link p-0">
                            Bingo
                        </Link>
                    </Nav.Link>
                    <Nav.Link
                        className="d-lg-none"
                        onClick={() => confirm({
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
                <Nav className="ms-auto mx-3 d-none d-lg-flex">
                    <Nav.Item className="p-0">
                        <UserAvatarName displayName={""} photoURL={auth.currentUser?.photoURL} />
                    </Nav.Item>
                    <UserDropdown />
                </Nav>
            </Navbar.Collapse>
        </Navbar>
        {(roles?.includes('host') || roles?.includes('admin')) && (
            <BreadcrumbsBar />
        )}
        <Container className="mt-1">
            <Outlet />
        </Container>
    </>
}
export default Layout;