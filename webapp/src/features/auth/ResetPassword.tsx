import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Form, Card, Button, Alert, Stack } from 'react-bootstrap';
import Login from './Login';

const ResetPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState<boolean | null>(null);

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        sendPasswordResetEmail(auth, email)
            .then(() => {
                setSuccess(true);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(`${errorCode}: ${errorMessage}`)
            });
    }

    return <Card>
        <Card.Body>
            <Card.Title>Password Reset</Card.Title>

            {success ?
                <>
                <Alert className="mt-3">
                    <Alert.Heading>Password Reset Request has been Sent</Alert.Heading>
                    If your email address is associated with an account, you will receive an email with instructions to reset your password.  Once completed, return and login.
                </Alert>
                <Login />
                </>
                : <Form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label htmlFor="email-address">
                            Email address
                        </Form.Label>
                        <Form.Control
                            id="email-address"
                            name="email"
                            type="email"
                            required
                            placeholder="Email address"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>

                    <Stack className="mt-3 text-center" gap={2}>
                        <Button type="submit">
                            Request Password Reset
                        </Button>
                    </Stack>
                </Form>
            }

        </Card.Body>
    </Card>

}

export default ResetPassword