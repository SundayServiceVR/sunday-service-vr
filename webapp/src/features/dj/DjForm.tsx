import { FormEvent, useState } from "react";
import { Form, Button, Spinner, Stack } from "react-bootstrap";
import { Dj } from "../../util/types";

type Props = {
    dj: Dj,
    onSubmitDj: (dj: Dj) => void,
    busy: boolean,
    onCancel?: () => void
}

const DjForm = ({dj, onSubmitDj, busy, onCancel}: Props) => {

    const [formData, setFormData] = useState<Dj>(dj);

    const onSubmit = (evt: FormEvent) => {
        evt.preventDefault();
        onSubmitDj(formData);
    }

    if(busy) {
        return <Spinner />
    }

    return <div>
        <Form onSubmit={onSubmit}>
            <Form.Group className="mt-3">
                <Form.Label>Discord Username</Form.Label>
                <Form.Control
                    required
                    name="discord_username"
                    value={formData.discord_username}
                    type="input"
                    onChange={(e) => setFormData({...formData, "discord_username": e.target.value})} />
            </Form.Group>
            <Form.Group className="mt-3">
                <Form.Label>Dj Name</Form.Label>
                <Form.Control
                    required
                    name="dj_name"
                    value={formData.name}
                    type="input"
                    onChange={(e) => setFormData({...formData, "name": e.target.value})} />
            </Form.Group>
            <Form.Group className="mt-3">
                <Form.Label>Stream Url</Form.Label>
                <Form.Control 
                    name="stream_url"
                    value={formData.rtmp_url}
                    type="input"
                    aria-describedby="twitchUrlHelpBlock"
                    onChange={(e) => setFormData({...formData, "rtmp_url": e.target.value})} />
                <Form.Text id="twitchUrlHelpBlock" muted>
                    Typically VRCDN or Twitch, but a few dj's have their own streaming methods we can notate here.
                </Form.Text>
            </Form.Group>
            <Form.Group className="mt-3">
                <Form.Label>Twitch Username</Form.Label>
                <Form.Control
                    name="twitch_username"
                    value={formData.twitch_username}
                    type="input"
                    onChange={(e) => setFormData({...formData, "twitch_username": e.target.value})}/>
            </Form.Group>
            <Stack direction="horizontal" gap={3}>
                <Button variant="primary" type="submit" className="mt-3">
                    Submit
                </Button>
                { onCancel && <Button variant="primary" onClick={onCancel} className="mt-3">
                    Cancel
                </Button> }
            </Stack>
        </Form>
    </div>
}

export default DjForm;
