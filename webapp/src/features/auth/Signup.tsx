import React, { FormEvent, useState } from 'react';
import { ActionCodeSettings, sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Alert, Button, Card, Form, Spinner, Stack } from 'react-bootstrap';

const Signup = () => {

    const [email, setEmail] = useState('')
    const [success, setSuccess] = useState<boolean | null>(null);

    const actionCodeSettings: ActionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: `http://localhost:3000/sunday-service-vr/confirm`,
        // This must be true.
        handleCodeInApp: true,
        // iOS: {
        //     bundleId: 'com.example.ios'
        // },
        // android: {
        //     packageName: 'com.example.android',
        //     installApp: true,
        //     minimumVersion: '12'
        // },
        // dynamicLinkDomain: `localhost`
        // sunday-service-vr.firebaseapp.com
        // sunday-service-vr.web.app
    };

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        // await createUserWithEmailAndPassword(auth, email, password)
        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`${errorCode}: ${errorMessage}`)
        }

        
        setSuccess(true);
        window.localStorage.setItem('emailForSignIn', email);
    }


    return success ? 
        <Alert>
            <Alert.Heading>Email Confirmation Requried</Alert.Heading>
            Check your email for instructions on confirming your email address.
        </Alert>
        :
        <Card>
        <Card.Body>
            <Card.Title>Organizer Signup</Card.Title>
            <Form onSubmit={onSubmit}>
                <Form.Group>
                    <Form.Label htmlFor="email-address">
                        Email address
                    </Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Email address"
                    />
                </Form.Group>
                {/* <Form.Group>
                    <Form.Label htmlFor="password">
                        Password
                    </Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                    />
                </Form.Group> */}
            </Form>
            <Stack gap={1} className="text-center mt-3">
                <Button type="submit">
                    Sign up
                </Button>
                <div className='text-center'><Spinner /></div>
            </Stack>

        </Card.Body>
    </Card>
}

export default Signup