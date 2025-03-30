import { useEventOperations } from "../outletContext";
import EventBasicDetailsForm from "./EventBasicDetailsForm";
import "react-datepicker/dist/react-datepicker.css";
import { Card, CardBody } from "react-bootstrap";
import { getSignupsPostedMessage } from "../../../util/messageWriters";
import MessagePasteCard from "../messaging/MessagePasteCard";
import { doc, getDoc, getFirestore } from "@firebase/firestore";
import { useEffect, useState } from "react";
import Spinner from "../../../components/spinner";

const EventDetails = () => {

    const [signupSheetUrl, setSignupSheetUrl] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchSignupUrl = async () => {
            const firestore = getFirestore();
            const docRef = doc(firestore, "/global/global_settings");
            try {
                const docSnap = await getDoc(docRef);
                const url = docSnap.exists() ? docSnap.data().signup_url : "unable to find signup url";
                setSignupSheetUrl(url);
            } catch (error) {
                console.error("Error fetching signup URL:", error);
                setSignupSheetUrl("unable to find signup url");
            } finally {
                setLoading(false);
            }
        };

        fetchSignupUrl();
    }, []);

    const [eventScratchpad, proposeEventChange] = useEventOperations();
    const message = getSignupsPostedMessage(eventScratchpad, signupSheetUrl);

    return <>
        <Card>
            <CardBody>
                <h2 className="display-6">Event Setup</h2>
                <EventBasicDetailsForm event={eventScratchpad} onEventChange={proposeEventChange} />
            </CardBody>
        </Card>
        <Card className="mt-4">
            <CardBody>
                { loading ? <Spinner type="simple" /> : 
                    <div>
                        <h2 className="display-6">Signup Sheet</h2>
                        <p>At the start of the week (usually Monday), unlock the S4 signup spreadsheet and post a link to it in <a target="_blank"
                            rel="noopener noreferrer"
                            href="https://discord.com/channels/1004489038159413248/1204320477732929566">
                                #scheduling
                        </a> in Discord.</p>
                        <p>
                            Here's a sample message to get you started.
                        </p>
                        <MessagePasteCard message={message}></MessagePasteCard>
                    </div>
                }
               
            </CardBody>
        </Card>
    </>
};

export default EventDetails;
