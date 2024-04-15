import React, { useEffect } from 'react';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Logout = () => {

    useEffect(() => {
        signOut(auth);
    }, [])

    return <Alert  className="my-auto" variant="light">
            <Alert.Heading>Bye Forever...</Alert.Heading>
            <Link to="/login">Back to Login</Link>
        </Alert>
}

export default Logout;