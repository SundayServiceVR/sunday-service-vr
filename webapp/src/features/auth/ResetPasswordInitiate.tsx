import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Form, Card, Button } from 'react-bootstrap';
 
const ResetPasswordInitiate = () => {
    const navigate = useNavigate();
 
    const [email, setEmail] = useState('')

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
         
            <div className="mt-3">
                <Button onClick={onSubmit}>      
                    Request Password Reset                                                                  
                </Button>
            </div>                               
        </Form>
    </Card.Body>
</Card>

}
 
export default ResetPasswordInitiate