import { useEffect, useState } from "react";
import { Event } from "../../util/types";
import { Alert, AlertHeading, Breadcrumb, Button, Nav, Stack, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import Spinner from "../../components/spinner";
import { CurrentOrNextEvent } from "../../components/currentOrNextEvent/CurrentOrNextEvent";
import { getAllEvents } from "../../store/events";
import { useEventDjCache } from "../../contexts/eventDjCacheProvider";

type Props = {
    past?: boolean;
}

const EventList = ({ past = false}: Props) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const { djCache } = useEventDjCache();

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

    const getDjNamesForEvent = (event: Event) => {
        return event.slots
            .map(slot => slot.signup_uuid && 
                event.signups
                    .find(signup => signup.uuid === slot.signup_uuid)
                    ?.dj_refs
                    .map(dj_ref => djCache.get(dj_ref.id)
                    ?.dj_name
                ?? "Unknown DJ"))
    }

    return <section>
        <Breadcrumb className="px-2">
            <Breadcrumb.Item><Link to="/events">Events</Link></Breadcrumb.Item>
        </Breadcrumb>
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
                        <th>Slots</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map(event => <tr key={event.id}>
                        <td><Link to={`/events/${event.id}`}>{event.start_datetime.toLocaleDateString()}</Link></td>
                        <td>{event.name}</td>
                        <td>{event.host}</td>
                        <td>{getDjNamesForEvent(event).flat().join(", ")}</td>
                    </tr>)}
                </tbody>
            </Table>
        }
    </section>
}

export default EventList;