import { Button, Card, CardBody, CardFooter, Form } from "react-bootstrap";

type Props = {
    message : string,
    destinationText?: string,
    destinationLink?: string
};

const EventPasteCard = ({message, destinationText, destinationLink}: Props) => {
    return <Card>
        <CardBody>
            <Form.Control as="textarea" value={message} rows={16} readOnly className="has-fixed-size" />
        </CardBody>
        <CardFooter className="d-grid gap-2">
            {
            destinationText ? 
                (
                    <p className="mb-0 ">
                        {destinationLink ? 
                            <>Copy this to: <a target="_blank" 
                                                rel="noopener noreferrer" 
                                                href={destinationLink}>
                                                    {destinationText}
                                            </a>.
                            </>
                            : <>Copy this to {destinationText}.</>
                        }
                    </p>
                )
                : ""
            }
        <Button color={"primary"} onClick={() => { navigator.clipboard.writeText(message); }}>Copy Text</Button>
        </CardFooter>
    </Card>;
};

export default EventPasteCard;