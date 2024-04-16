import React, { useEffect, useState } from 'react';
import { isSignInWithEmailLink, sendPasswordResetEmail, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Form, Card, Button, Alert, Stack } from 'react-bootstrap';
import { Navigate } from 'react-router';
import { Home } from '../home/Home';
import { Link } from 'react-router-dom';

const Confirm = () => {
    const [success, setSuccess] = useState<boolean | null>(null);

    useEffect(() => {
        // Confirm the link is a sign-in with email link.
        if (isSignInWithEmailLink(auth, window.location.href)) {
            // Additional state parameters can also be passed via URL.
            // This can be used to continue the user's intended action before triggering
            // the sign-in operation.
            // Get the email if available. This should be available if the user completes
            // the flow on the same device where they started it.
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                // User opened the link on a different device. To prevent session fixation
                // attacks, ask the user to provide the associated email again. For example:
                email = window.prompt('Please provide your email for confirmation');
            } else {
            // The client SDK will parse the code from the link for you.
            signInWithEmailLink(auth, email, window.location.href)
                .then((result) => {
                    // Clear email from storage.
                    window.localStorage.removeItem('emailForSignIn');
                    // You can access the new user via result.user
                    // Additional user info profile not available via:
                    // result.additionalUserInfo.profile == null
                    // You can check if the user is new or existing:
                    // result.additionalUserInfo.isNewUser

                    setSuccess(true);
                })
                .catch((error) => {
                    // Some error occurred, you can inspect the code: error.code
                    // Common errors could be invalid email and invalid or expired OTPs.
                });
            }

        }
    }, []);

    return success 
        ? <Alert variant='success'>
            <Alert.Heading>Successfully registered</Alert.Heading>
            Set your password with <Link to="/resetPassword">Password Reset</Link>.
            <aside>Deer is too lazy to make a better auth flow for admin users.</aside>
        </Alert>
        : <div>Completing Registration. <Link to="/login">Login</Link></div>

}

export default Confirm