import { FormEvent, useState } from 'react';
import { signInWithEmailAndPassword  } from 'firebase/auth';
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { auth } from '../../util/firebase';
import { Alert, Button, Card, Form, Stack } from 'react-bootstrap';

 
const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<Error>();

    const alert = searchParams.get('alert');
       
    const onLogin = (event: FormEvent) => {
        event.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            const redirectRoute = localStorage.getItem("loginRedirectRoute") ?? "/";
            navigate(redirectRoute);
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

    return <>
        {alert === "pwrst" ? (
          <Alert className="">
              <Alert.Heading>Password Reset Request has been Sent</Alert.Heading>
              If your email address is associated with an account, you will receive an email with instructions to reset your password.  Once completed, return and login.
          </Alert>
        ) : null}
        <Card>
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
    </>;
}
 
export default Login