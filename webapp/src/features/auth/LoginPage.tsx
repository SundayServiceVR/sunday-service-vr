import logo from '../../assets/svg/S4_Logo.svg';
import discordIcon from '../../assets/svg/Discord-Symbol-White.svg';

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f9' }}>
        <div style={{ textAlign: 'center', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}>
          <img src={logo} alt="Logo" style={{ marginBottom: '20px', width: '100px', height: 'auto' }} />
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Welcome to Sunday Service VR</h2>
          <button onClick={() => loginWithDiscord()} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '16px', borderRadius: '5px', backgroundColor: '#5865F2', color: '#fff' }}>
            <img src={discordIcon} alt="Discord Icon" style={{ width: '20px', height: '20px', marginRight: '10px' }} />
            Login with Discord
          </button>
        </div>
      </div>
    );
  }

export default LoginPage;