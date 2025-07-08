import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import logo from '../../assets/svg/S4_Logo.svg';
import discordIcon from '../../assets/svg/Discord-Symbol-White.svg';
import DarkModeToggle from '../../components/DarkModeToggle';

const loginWithDiscord = () => {
  const clientId = '1225554722916663376';
  const redirectUri = encodeURIComponent(window.location.origin + '/discordRedirect');
  const scope = 'identify guilds.members.read';
  const responseType = 'code';

  const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
  window.location.href = DISCORD_AUTH_URL;
};


const LoginPage = () => {
    return (
      <Container className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Row className="w-100">
          <Col md={6} lg={4} className="mx-auto">
            <div className="position-absolute top-0 end-0 m-3">
              <DarkModeToggle />
            </div>
            <Card className="login-card shadow">
              <Card.Body className="text-center p-4">
                <img src={logo} alt="Logo" className="mb-4" style={{ width: '100px', height: 'auto' }} />
                <h2 className="mb-4">Welcome to Sunday Service VR</h2>
                <Button 
                  onClick={() => loginWithDiscord()} 
                  className="d-flex align-items-center justify-content-center mx-auto"
                  style={{ backgroundColor: '#5865F2', borderColor: '#5865F2', padding: '10px 20px', fontSize: '16px' }}
                >
                  <img src={discordIcon} alt="Discord Icon" style={{ width: '20px', height: '20px', marginRight: '10px' }} />
                  Login with Discord
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

export default LoginPage;