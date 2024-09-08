import { Form } from "react-bootstrap";
import { Dj } from "../../util/types";

import Spinner from "../../components/spinner";

type Props = {
    dj: Dj,
    setDj: React.Dispatch<React.SetStateAction<Dj>>,
    busy: boolean,
}

const DjForm = ({dj, setDj, busy}: Props) => {

    if(busy) {
        return <Spinner type="logo" />;
    }

    return <>
        <Form.Group className="mt-3">
            <Form.Label>Discord ID</Form.Label>
            <Form.Control
                // required // Will be reset to required when we have instructions and potially more info in our signup sheets to support this.
                name="discord_id"
                value={dj.discord_id}
                type="input"
                onChange={(e) => setDj({...dj, "discord_id": e.target.value})} />
        </Form.Group>
        <Form.Group className="mt-3">
            <Form.Label>Name (Furname, Username, Etc...)</Form.Label>
            <Form.Control
                required
                name="public_name"
                value={dj.public_name}
                type="input"
                onChange={(e) => setDj({...dj, "public_name": e.target.value})} />
        </Form.Group>
        <Form.Group className="mt-3">
            <Form.Label>Dj Name</Form.Label>
            <Form.Control
                required
                name="dj_name"
                value={dj.dj_name}
                type="input"
                onChange={(e) => setDj({...dj, "dj_name": e.target.value})} />
        </Form.Group>
        <Form.Group className="mt-3">
            <Form.Label>Stream Url</Form.Label>
            <Form.Control
                name="stream_url"
                value={dj.rtmp_url}
                type="input"
                aria-describedby="twitchUrlHelpBlock"
                onChange={(e) => setDj({...dj, "rtmp_url": e.target.value})} />
            <Form.Text id="twitchUrlHelpBlock" muted>
                Typically VRCDN or Twitch, but a few dj's have their own streaming methods we can notate here.
            </Form.Text>
        </Form.Group>
        <Form.Group className="mt-3">
            <Form.Label>Twitch Username</Form.Label>
            <Form.Control
                name="twitch_username"
                value={dj.twitch_username}
                type="input"
                onChange={(e) => setDj({...dj, "twitch_username": e.target.value})}/>
        </Form.Group>
    </>
}

export default DjForm;
