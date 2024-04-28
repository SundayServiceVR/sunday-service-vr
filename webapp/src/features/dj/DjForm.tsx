import React, { useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { Dj } from "../../util/types";

type Props = {
    dj: Dj,
    onSubmitDj: (dj: Dj) => void,
    busy: boolean,
}

const DjForm = ({dj, onSubmitDj, busy}: Props) => {

    const [formData, setFormData] = useState<Dj>(dj);

    const onSubmit = () => {
        onSubmitDj(formData);
    }

    if(busy) {
        return <Spinner />
    }

    return <div>
        <Form className="pt-3" onSubmit={onSubmit}>
            <Form.Group>
                <Form.Label>Discord Username</Form.Label>
                <Form.Control
                    required
                    name="discord_username"
                    value={formData.discord_username}
                    type="input"
                    onChange={(e) => setFormData({...formData, "discord_username": e.target.value})} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Dj Name</Form.Label>
                <Form.Control
                    required
                    name="dj_name"
                    value={formData.dj_name}
                    type="input"
                    onChange={(e) => setFormData({...formData, "dj_name": e.target.value})} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Stream Url</Form.Label>
                <Form.Control 
                    name="stream_url"
                    value={formData.stream_url}
                    type="input"
                    aria-describedby="twitchUrlHelpBlock"
                    onChange={(e) => setFormData({...formData, "stream_url": e.target.value})} />
                <Form.Text id="twitchUrlHelpBlock" muted>
                    Typically VRCDN or Twitch, but a few dj's have their own streaming methods we can notate here.
                </Form.Text>
            </Form.Group>
            <Form.Group>
                <Form.Label>Twitch URL</Form.Label>
                <Form.Control
                    name="twitch_url"
                    value={formData.twitch_url}
                    type="input"
                    onChange={(e) => setFormData({...formData, "twitch_url": e.target.value})}/>
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
                Submit
            </Button>
        </Form>
    </div>
}

export default DjForm;
