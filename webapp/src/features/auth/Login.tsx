import React, { FormEvent, useState } from 'react';
import { signInWithEmailAndPassword  } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase/config';
import { Alert, Button, Card, Form, Stack } from 'react-bootstrap';

 
const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<Error>();
       
    const onLogin = (event: FormEvent) => {
        event.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            navigate("/")
            console.log(user);
        })
        .catch((error) => {
            setError(error);
        });
    }

    const remapMessage = (message: string) => {
        if(message === "Firebase: Error (auth/invalid-credential).") { return "Invalid Login Credentials."}
        return message;
    }

    return <Card>
        <Card.Body>
            <Card.Title>Organizer Login</Card.Title>
            <Form onSubmit={onLogin}>                                              
                <Form.Group>
                    <Form.Label htmlFor="email-address">
                        Email
                    </Form.Label>
                    <Form.Control
                        id="email-address"
                        name="email"
                        type="email"                                    
                        required                                                                                
                        placeholder="Email address"
                        onChange={(e)=>setEmail(e.target.value)}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label htmlFor="password">
                        Password
                    </Form.Label>
                    <Form.Control
                        id="password"
                        name="password"
                        type="password"                                    
                        required                                                                                
                        placeholder="Password"
                        onChange={(e)=>setPassword(e.target.value)}
                    />
                </Form.Group>
                <Stack className="mt-3 text-center" gap={2}>
                    <Button type="submit">      
                        Login                                                                  
                    </Button>
                    <Link to="/resetPassword">Reset Password</Link>
                </Stack>
                { error && <Alert variant='danger' className="my-3">
                    <Alert.Heading>Oops...</Alert.Heading>
                    <p>{ remapMessage(error.message) }</p>
                </Alert>}                              
            </Form>
        </Card.Body>
    </Card>
}
 
export default Login