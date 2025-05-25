import { Alert } from 'react-bootstrap';

const AuthErrorAlert = () => (
    <Alert variant="danger" className="text-center">
        <Alert.Heading>Authentication Error</Alert.Heading>
        <p>
            You are not authenticated. Please log in to access this page.
        </p>
    </Alert>
);

export default AuthErrorAlert;