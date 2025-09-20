import { Container, Nav, Navbar } from 'react-bootstrap';
import { Outlet } from "react-router";
import { useContext, useState } from "react";
import { FirebaseAuthContext } from "../../contexts/FirebaseAuthContext";
import UserAvatarName from "../../components/userAvatarName";
import { confirm } from "../../components/confirm";
import AuthErrorAlert from "./AuthErrorAlert";
import BreadcrumbsBar from "./BreadcrumbsBar";
import UserDropdown from "./UserDropdown";
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import RoleSimulationModal from "../../components/roleSimulation/RoleSimulationModal";

const Layout = () => {
    const { auth, roles, actualRoles, isSimulatingRoles, setSimulatedRoles, clearRoleSimulation } = useContext(FirebaseAuthContext);
    const [showRoleModal, setShowRoleModal] = useState(false);

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
                    
                    {/* Developer Role Simulation - only show in navbar when actively simulating */}
                    {actualRoles?.includes('developer') && isSimulatingRoles && (
                        <Nav.Link 
                            as="span" 
                            onClick={() => setShowRoleModal(true)}
                            style={{ cursor: 'pointer' }}
                            className="text-warning"
                            title="Currently simulating roles - click to modify"
                        >
                            🎭 Role Sim Active
                        </Nav.Link>
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
                    <UserDropdown onShowRoleModal={() => setShowRoleModal(true)} />
                </Nav>
            </Navbar.Collapse>
        </Navbar>
        
        {/* Role Simulation Status Bar */}
        {isSimulatingRoles && (
            <div className="bg-warning text-dark py-2 px-3">
                <div className="container d-flex justify-content-between align-items-center">
                    <small>
                        <strong>🎭 Role Simulation Active:</strong> Currently simulating [{roles?.join(', ')}] | 
                        Actual roles: [{actualRoles?.join(', ')}]
                    </small>
                    <button 
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => clearRoleSimulation?.()}
                    >
                        Clear Simulation
                    </button>
                </div>
            </div>
        )}

        {(roles?.includes('host') || roles?.includes('admin')) && (
            <BreadcrumbsBar />
        )}
        
        <Container className="mt-1">
            <Outlet />
        </Container>
        
        {/* Role Simulation Modal */}
        {actualRoles?.includes('developer') && (
            <RoleSimulationModal
                show={showRoleModal}
                handleClose={() => setShowRoleModal(false)}
                currentSimulatedRoles={roles || []}
                onRoleSimulationChange={(newRoles: string[]) => {
                    if (setSimulatedRoles) {
                        if (newRoles.length === 4 && newRoles.includes('admin') && newRoles.includes('host') && newRoles.includes('dj') && newRoles.includes('developer')) {
                            // If all roles are selected, clear simulation instead
                            clearRoleSimulation?.();
                        } else {
                            setSimulatedRoles(newRoles);
                        }
                    }
                }}
            />
        )}
    </>
}
export default Layout;