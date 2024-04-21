import React, { useEffect, useState } from "react";
import { docToEvent } from "../../store/events";
import { Timestamp, collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Event } from "../../util/types";
import { db } from "../../util/firebase";
import { Alert, AlertHeading, Breadcrumb, Button, Spinner, Stack, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const EventList = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        (async () => {
            const q = query(collection(db, "events"), where("start_datetime", ">=", Timestamp.now()), orderBy("start_datetime", "asc")); //
            const querySnapshot = await getDocs(q);

            const events: Event[] = querySnapshot.docs
                .map((doc) => docToEvent(doc))
                .filter((event): event is Exclude<typeof event, null> => event !== null);
            setEvents(events ?? []);
            setLoading(false);
        })()
    }, []);

    if (loading) {
        return <Spinner />
    }



    return <section>
        <Breadcrumb className="px-2">
            <Breadcrumb.Item><Link to="/events">Events</Link></Breadcrumb.Item>
        </Breadcrumb>
        <Stack direction="horizontal" gap={3}>
            <span className="me-auto" />
            <Button variant="primary" onClick={()=>navigate("/events/create")}>Create Event</Button>
        </Stack>

        { events.length <= 0 && <Alert variant="warning"><AlertHeading>No Events Found</AlertHeading>Should we add an event?</Alert> }

        { events.length > 0 &&
            <Table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Host</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map(event => <tr key={event.id}>
                        <td><Link to={`/events/${event.id}`}>{event.start_datetime.toLocaleDateString()}</Link></td>
                        <td>{event.name}</td>
                        <td>{event.host}</td>
                    </tr>)}
                </tbody>
            </Table>
        }
    </section>
}

export default EventList;