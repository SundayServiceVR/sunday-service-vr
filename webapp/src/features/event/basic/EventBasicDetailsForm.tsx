import { Form } from "react-bootstrap";
import { Event } from "../../../util/types";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
    event: Event,
    onEventChange: (event: Event) => void,
}

const EventBasicDetailsForm = ({ event: eventScratchpad, onEventChange: proposeEventChange }: Props) => {
    return <>
        <Form>
        <Form.Group>
            <Form.Label aria-required="true">
                Event Name
            </Form.Label>
            <Form.Control
                placeholder="Sunday Service"
                type="text"
                value={eventScratchpad.name}
                required
                onChange={(formEvent) => { proposeEventChange(({ ...eventScratchpad, name: formEvent.target.value })); }}
            />
        </Form.Group>
        <Form.Group className="mt-2">
            <Form.Label>
                Date/Time (Local)
            </Form.Label>
            <Form.Control
                type="datetime-local"
                value={new Date(eventScratchpad.start_datetime.getTime() - eventScratchpad.start_datetime.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16)}
                required
                onChange={(formEvent) => {
                    const start_datetime = Date.parse(formEvent.target.value);
                    if(!isNaN(start_datetime)) {
                        proposeEventChange({ ...eventScratchpad, start_datetime: new Date(start_datetime) })
                    }
                }}
                className="input" />
        </Form.Group>
        <Form.Group className="mt-2">
            <Form.Label>
                Host
            </Form.Label>
            <Form.Control
                placeholder="TBD"
                type="text"
                value={eventScratchpad.host}
                required
                onChange={(formEvent) => { proposeEventChange({ ...eventScratchpad, host: formEvent.target.value }); }}
            />
        </Form.Group>
               <Form.Group className="mt-2">
            <Form.Label>
                Signups Open
            </Form.Label>
            <Form.Check
                type="switch"
                checked={eventScratchpad.signupsAreOpen}
                required
                onChange={(formEvent) => { 
                    const checked = (formEvent.target as HTMLInputElement).checked;
                    proposeEventChange({ ...eventScratchpad, signupsAreOpen: checked }); 
                }}
            />
        </Form.Group>
        <Form.Group className="mt-2">
            <Form.Label>
                Live Jive Event
            </Form.Label>
            <Form.Check
                type="switch"
                checked={eventScratchpad.signup_configuration?.isLiveJive || false}
                onChange={(formEvent) => { 
                    const checked = (formEvent.target as HTMLInputElement).checked;
                    proposeEventChange({ 
                        ...eventScratchpad, 
                        signup_configuration: {
                            ...eventScratchpad.signup_configuration,
                            isLiveJive: checked
                        }
                    }); 
                }}
            />
            <Form.Text className="text-muted">
                Enable this for "Live Jive" events where only live performances are allowed (typically the last Sunday of the month).
            </Form.Text>
        </Form.Group>
    </Form>
    </>

};

export default EventBasicDetailsForm;
