import { useEffect, useState } from "react";
import { Event } from "../../util/types";
import { Alert, AlertHeading, Button, Nav, Stack, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import Spinner from "../../components/spinner/Spinner";
import { CurrentOrNextEvent } from "../../components/currentOrNextEvent/CurrentOrNextEvent";
import { getAllEvents } from "../../store/events";

type Props = {
    past?: boolean;
}

const EventList = ({ past = false}: Props) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        (async () => {
            const events = await getAllEvents(
                past ? "desc" : "asc",
                past ? "past" : "future"
            );
            setEvents(events ?? []);
            setLoading(false);
        })()
    }, [past]);

    if (loading) {
        return <Spinner type="logo" />
    }

    return <section>
        <CurrentOrNextEvent />
        <Stack direction="horizontal" gap={3}>
            <span className="me-auto" />
            <Button variant="primary" onClick={()=>navigate("/events/create")}>Create Event</Button>
        </Stack>
        <Stack direction="horizontal" gap={3}>
            <Nav variant="tabs" className="w-100">
                <Nav.Item>
                <Link to="/events"className={`nav-link ${past ? "" : "active"}`}>Upcoming Events</Link>
                </Nav.Item>
                <Nav.Item>
                    <Link to="/events/past"className={`nav-link ${past ? "active" : ""}`}>Past Events</Link>
                </Nav.Item>
            </Nav>
        </Stack>

        { events.length <= 0 && <Alert variant="warning"><AlertHeading>No Events Found</AlertHeading>Should we add an event?</Alert> }

        { events.length > 0 &&
            <Table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Host</th>
                        <th>Djs</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map(event => <tr key={event.id}>
                        <td><Link to={`/events/${event.id}`}>{event.start_datetime.toLocaleDateString()}</Link></td>
                        <td>{event.name}</td>
                        <td>{event.host}</td>
                        <td>{event.slots.map(slot => (slot.reconciled.djs?.map(dj => dj.dj_name).join(" + ") || slot.reconciled.signup.name)).join(", ")}</td>
                    </tr>)}
                </tbody>
            </Table>
        }
    </section>
}

export default EventList;