import { Col, Container, Figure, Row } from 'react-bootstrap';

import discordDevSettings from './discord-dev-settings.png';
import rightClickName from "./right-click-name.png";
import rightClickSearch from "./right-click-search.png";

export const DiscordIdInfo = () => <>
    <Container className='py-3'>
        <h2>How to Discord ID</h2>
        <Row>
            <Col xs={12} className='py-3'>
                <p>
                    This app uses discord ids to uniquely identify djs.  This helps eliminate any ambiguity from performers
                    who chose to change names or want to perform under a different name, and it ensures we have a point
                    of contact for every person who plays.
                </p>
                <p>
                    To view someone's discord ID, you need to enable Developer Mode in the discord app. This ultimately just provides additional
                    information in menus, and it doesn't affect the performance of the app.
                </p>
            </Col>
            <hr />
            <Col md={4} className='py-3 lead d-flex flex-column align-items-center justify-content-center'>
                <p className='text-center'>To enable developer mode in the discord desktop app:</p>
                <ol>
                    <li>Open the settings panel</li>
                    <li>Open the "Advanced" tab</li>
                    <li>Toggle Developer Mode</li>
                </ol>
            </Col>
            <Col md={8} className='py-3 text-center'>
                <Figure>
                    <Figure.Image
                        alt={`Example of the "Developer Mode" toggle enabled.`}
                        src={discordDevSettings}
                    />
                </Figure>
            </Col>
            <Col xs={12} className='py-4 lead text-center'>
                <p>Now, when you right click users, messages, servers, etc. you'll be provided an option to copy the ID.</p>
            </Col>
            <Col md={6} className='py-3'>
                <Figure className='text-center'>
                    <Figure.Image
                        alt={`Example of getting a user's discord id`}
                        src={rightClickName}
                    />
                    <Figure.Caption>
                        If you have the user you want the ID of in a chat, you can just right click their name and click Copy User ID.
                    </Figure.Caption>
                </Figure>
            </Col>
            <Col md={6} className='py-3'>
                <Figure className='text-center'>
                    <Figure.Image
                        alt={`Example of searching for a user`}
                        src={rightClickSearch}
                    />
                    <Figure.Caption>
                        If the user isn't easy to find, you can perform a search from: username (allowing it to autocomplete the username to resolve the user) and
                        then right click the user but here click Copy Author ID.
                    </Figure.Caption>
                </Figure>
            </Col>
        </Row>
    </Container>
</>