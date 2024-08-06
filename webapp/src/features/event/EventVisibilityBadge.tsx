import { Badge, OverlayTrigger, Popover } from "react-bootstrap";
import { Event } from "../../util/types";

type Props = {
    event: Event
}

const renderPublishedStatusTooltip = (event: Event) => event.published 
    ? <Popover>
        <Popover.Header as="h3">Published Event</Popover.Header>
        <Popover.Body>
            This event's lineup is visible.
        </Popover.Body>
    </Popover>
    : <Popover>
        <Popover.Header as="h3">Unpublished Event</Popover.Header>
        <Popover.Body>
            This event's lineup will not be displayed until it is published.
        </Popover.Body>
    </Popover>;

export const EventVisibilityBadge = ({ event }: Props) =>
    <OverlayTrigger overlay={renderPublishedStatusTooltip(event)} placement="right">
        <Badge pill bg={ event.published ? "success" : "secondary" } className="mx-2">{ event.published ? "Published" : "Unpublished" } </Badge>
    </OverlayTrigger>