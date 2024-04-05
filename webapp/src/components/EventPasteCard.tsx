import { Button, Card, CardBody, CardFooter, CardHeader, Form, Tabs, Tab} from "react-bootstrap";
import { Event, Slot } from "../util/types";

type Props = {
    event: Event,
    message : string
};

const EventPasteCard = ({ event, message }: Props) => {
    return <Card>
        <CardBody>
            <Form.Control as="textarea" value={message} rows={16} readOnly className="has-fixed-size" />
        </CardBody>
        <CardFooter className="d-grid gap-2">
            <Button color={"primary"} onClick={() => { navigator.clipboard.writeText(message); }}>Copy Text</Button>
        </CardFooter>
    </Card>;
};

export default EventPasteCard;