import React, {useState} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {  ActionCodeSettings, sendPasswordResetEmail, sendSignInLinkToEmail  } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Form, Card, Button } from 'react-bootstrap';
 
const ResetPassword = () => {
    const navigate = useNavigate();
 
    const [email, setEmail] = useState('')
    const [emailConfirm, setEmailConfirm] = useState('');
 


    const onSubmit: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
      event.preventDefault()
      sendPasswordResetEmail(auth, email)
        .then(() => {

        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ..
        });
    }
 
  return <Card>
    <Card.Body>
        <Card.Title>Organizer Login</Card.Title>
        <Form>                                              
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
                    onChange={(e)=>setEmailConfirm(e.target.value)}
                />
            </Form.Group>
            <div className="mt-3">
                <Button onClick={onSubmit}>      
                    Login                                                                  
                </Button>
            </div>                               
        </Form>
    </Card.Body>
</Card>

}
 
export default ResetPassword