import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../util/firebase';
import { Form, Card, Button, Stack } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';

const ResetPassword = () => {

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
                <Navigate to={"/login?alert=pwrst"} />
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