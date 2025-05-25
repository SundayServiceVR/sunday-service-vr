import { Form } from "react-bootstrap";
import { Dj } from "../../util/types";
import { Link } from "react-router-dom";
import Spinner from "../../components/spinner/Spinner";

type Props = {
    dj: Dj,
    setDj: React.Dispatch<React.SetStateAction<Dj>>,
    busy: boolean,
}

const DjForm = ({ dj, setDj, busy }: Props) => {

    if (busy) {
        return <Spinner type="logo" />;
    }

    return <>
        <Form.Group className="mt-3">
            <Form.Label className="required">Discord ID</Form.Label>
            <small><Link className="mx-2" to="/discordIdInfo" target="_blank" rel="noopener noreferrer">(How do I find a Discord User Id?)</Link></small>
            <Form.Control
                required
                name="discord_id"
                value={dj.discord_id}
                type="input"
                pattern="[0-9]{17,}"
                title="A Discord ID is a user identification number (UID) at least 17 digits long."
                onChange={(e) => setDj({ ...dj, "discord_id": e.target.value })} />
        </Form.Group>
        <Form.Group className="mt-3">
            <Form.Label className="required">Name (Furname, Username, Etc...)</Form.Label>
            <Form.Control
                required
                name="public_name"
                value={dj.public_name}
                type="input"
                onChange={(e) => setDj({ ...dj, "public_name": e.target.value })} />
        </Form.Group>
        <Form.Group className="mt-3">
            <Form.Label className="required">Dj Name</Form.Label>
            <Form.Control
                required
                name="dj_name"
                value={dj.dj_name}
                type="input"
                onChange={(e) => setDj({ ...dj, "dj_name": e.target.value })} />
        </Form.Group>
        <Form.Group className="mt-3">
            <Form.Label>Stream Url</Form.Label>
            <Form.Control
                name="stream_url"
                value={dj.rtmp_url}
                type="input"
                aria-describedby="twitchUrlHelpBlock"
                onChange={(e) => setDj({ ...dj, "rtmp_url": e.target.value })} />
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
                onChange={(e) => setDj({ ...dj, "twitch_username": e.target.value })} />
        </Form.Group>
    </>
}

export default DjForm;
