import { Button, Card, CardBody, CardFooter, Form } from "react-bootstrap";

type Props = {
    message : string,
    footerInstructions? : React.ReactNode,
    textBoxLabel? : string
};

const EventPasteCard = ({message, footerInstructions, textBoxLabel}: Props) => {
    return <Card>
        <CardBody>
            <Form.Control aria-label={textBoxLabel} as="textarea" value={message} rows={16} readOnly className="has-fixed-size" />
        </CardBody>
        <CardFooter className="d-grid gap-2">
        { footerInstructions ?? "" }
        <Button color={"primary"} onClick={() => { navigator.clipboard.writeText(message); }}>Copy Text</Button>
        </CardFooter>
    </Card>;
};

export default EventPasteCard;