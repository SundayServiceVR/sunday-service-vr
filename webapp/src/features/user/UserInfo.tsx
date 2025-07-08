import { useContext } from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { FirebaseAuthContext } from "../../contexts/FirebaseAuthContext";

export const UserInfo = () => {
    const { user, roles } = useContext(FirebaseAuthContext);

    if (!user) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="text-center">
                            <Card.Body>
                                <h5>No user information available</h5>
                                <p>Please log in to view your user information.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header as="h2" className="text-center">
                            User Information
                        </Card.Header>
                        <Card.Body>
                            {/* Discord Info Section */}
                            <div className="mb-4">
                                <h4 className="border-bottom pb-2">Discord Information</h4>
                                
                                <Row className="mb-3">
                                    <Col sm={3}>
                                        <strong>Discord User:</strong>
                                    </Col>
                                    <Col sm={9} className="d-flex align-items-center">
                                        {user.photoURL ? (
                                            <img 
                                                src={user.photoURL} 
                                                alt="Discord Avatar" 
                                                className="rounded-circle me-3"
                                                style={{ width: '64px', height: '64px' }}
                                            />
                                        ) : (
                                            <div 
                                                className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                                                style={{ width: '64px', height: '64px' }}
                                            >
                                                <i className="fas fa-user text-muted"></i>
                                            </div>
                                        )}
                                        <div>
                                            <div className="fw-bold">
                                                {user.displayName || <span className="text-muted">Display name not available</span>}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col sm={3}>
                                        <strong>Discord ID:</strong>
                                    </Col>
                                    <Col sm={9}>
                                        <code className="bg-light p-1 rounded">
                                            {user.uid || <span className="text-muted">Not available</span>}
                                        </code>
                                    </Col>
                                </Row>
                            </div>

                            {/* Roles Section */}
                            <div className="mb-4">
                                <h4 className="border-bottom pb-2">Roles</h4>
                                <Row>
                                    <Col sm={3}>
                                        <strong>Current Roles:</strong>
                                    </Col>
                                    <Col sm={9}>
                                        {roles && roles.length > 0 ? (
                                            <div>
                                                {roles.map((role, index) => (
                                                    <Badge 
                                                        key={index} 
                                                        bg="primary" 
                                                        className="me-2 mb-1"
                                                    >
                                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted">No roles assigned</span>
                                        )}
                                    </Col>
                                </Row>
                            </div>

                            {/* Additional Firebase User Info */}
                            <div className="mb-4">
                                <h4 className="border-bottom pb-2">Account Details</h4>

                                <Row className="mb-3">
                                    <Col sm={3}>
                                        <strong>Account Created:</strong>
                                    </Col>
                                    <Col sm={9}>
                                        {user.metadata.creationTime ? 
                                            new Date(user.metadata.creationTime).toLocaleDateString() : 
                                            <span className="text-muted">Not available</span>
                                        }
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col sm={3}>
                                        <strong>Last Sign In:</strong>
                                    </Col>
                                    <Col sm={9}>
                                        {user.metadata.lastSignInTime ? 
                                            new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                                            <span className="text-muted">Not available</span>
                                        }
                                    </Col>
                                </Row>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};