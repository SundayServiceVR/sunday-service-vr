import { collection, documentId, DocumentReference, getDocs, query, where } from "firebase/firestore";
import { Button, Container, Card, Stack, Row, Col, ListGroup, Spinner } from "react-bootstrap"
import { Dj, Event } from "../../../util/types";
import { useEffect, useState } from "react";
import { docToRawType } from "../../../store/util";
import { db } from "../../../util/firebase";
import { ActionMenu } from "../../../components/actionMenu/ActionMenu";
import { useEventCache } from "./hooks/useEventCache";
import { Link } from "react-router-dom";
import { XSquare } from "react-feather";

type Props = {
  event: Event,
  onRemoveDjFromSignups: (dj_ref: DocumentReference) => void,
  onAddDjToLineup: (dj_ref: DocumentReference, name: string, is_debut: boolean) => void,
  onRemoveDjFromLineup: (dj_ref: DocumentReference) => void,
}

type DjInfoCache = {
  [key: string]: {
    dj: Dj,
    // events: {
    //   event_id: string,
    //   event_date: Date,
    // }
  },
};

const EventDjSignups = ({ event, onAddDjToLineup, onRemoveDjFromSignups }: Props) => {

  const [djCache, setDjCache] = useState<DjInfoCache>({});

  const [showHiddenDjs, setShowHiddenDjs] = useState(false);

  const [hiddenDjs] = useState<string[]>([]);

  const isHidableSubmission = (signup: { dj_ref: DocumentReference }) => hiddenDjs.includes(signup.dj_ref.id) || event.slots.map(slot => slot.dj_ref.id).includes(signup.dj_ref.id);

  const { eventCache, fetchEvents } = useEventCache();
  


  useEffect(() => {

    if (event.signups.length === 0) {
      setDjCache({});
      return;
    }

    (async () => {
      // I'd bank there's a better way to fetch these
      const q = query(collection(db, "djs"), where(documentId(), "in", event.signups.map(signup => signup.dj_ref.id)));
      const querySnapshot = await getDocs(q);
      const newDjCache: DjInfoCache = {};

      querySnapshot.docs
        .forEach((doc) => {
          const dj = docToRawType<Dj>(doc);

          newDjCache[doc.ref.id] = {dj};
          
          if(!dj.events) {
            return;
          }

          // Fetch the related events throught he eventCache
          fetchEvents(dj.events);
        });
      setDjCache(newDjCache);
    })()
  }, [event.signups, fetchEvents]);

  
  const getDateFromCachedEvent = (eventRef: DocumentReference) => {
    const event = eventCache.get(eventRef.id);
    if (event === "PENDING" ) {
      return <Spinner size="sm" variant="secondary"/>;
    }

    if (!event) {
      return <XSquare />
    }

    return <span><Link to={`/events/${event.id}/lineup`} target="_blank">{event.name}: {event.start_datetime.toLocaleDateString()}</Link></span>;
  }

  return <Container className="px-0 pb-3">
    <Stack gap={3}>
      {event.signups.map(
        (signup) => {

          const dj: Dj | null = djCache[signup.dj_ref.id]?.dj ?? null;

          return <Card key={signup.dj_ref?.id}>
            <Card.Header>
              <Stack direction="horizontal" gap={1}>
                <div className="lead">
                  { hiddenDjs.includes(signup.dj_ref.id) && "(hidden)"}
                  { event.slots.map(slot => slot.dj_ref.id).includes(signup.dj_ref.id) && "(in lineup)"}
                  {dj?.dj_name ?? signup.dj_ref?.id}
                  </div>
                <div className="ms-auto"></div>
                <ActionMenu options={[
                  {
                    label: "Add To Lineup",
                    onClick: () => {
                      onAddDjToLineup(signup.dj_ref, dj.dj_name ?? "Unknown Name", true)
                    }
                  },
                  {
                    label: "Edit DJ",
                    // icon: faIdCard,
                    onClick: () => {
                      window.open(`/djs/${signup.dj_ref.id}`, '_blank', 'noreferrer')?.focus();
                    },
                  },
                  {
                    label: "Remove Signup",
                    // icon: faX,
                    onClick: () => {
                      onRemoveDjFromSignups(signup.dj_ref);
                    }
                  }
                ]} />
              </Stack>
            </Card.Header>
            <Card.Body>
              <Container>
                <Row>
                  <Col>
                    {/* <div>Availability: Blarg</div>
                  <div>Type: Live</div> */}
                    <div>Notes:
                      <ul>
                        { dj?.notes?.map((note, index) => <li key={`dj-note-${index}`}>{note}</li>)}
                      </ul>
                    </div>
                  </Col>
                  <Col>
                      <Stack direction="horizontal">
                      <span>Recent Events ({ dj?.events?.length ?? "?" } total)</span>
                      {/* <span className="ms-auto" />
                      <a>(See All)</a> */}
                      </Stack>
                    <ListGroup>
                      {dj?.events?.map((eventRef) => 
                        <ListGroup.Item key={eventRef.id} className="px-3 py-1">
                          { getDateFromCachedEvent(eventRef) }
                        </ListGroup.Item>
                      )}

                    </ListGroup>
                  </Col>
                </Row>
              </Container>
            </Card.Body>
          </Card>
        }
      ).filter((_, index) => showHiddenDjs || !isHidableSubmission(event.signups[index]))

      }

      {
        showHiddenDjs
          ? <Button variant="secondary" onClick={() => setShowHiddenDjs(false)}>
            Hide Submissions
          </Button>
          : <Button variant="secondary" onClick={() => setShowHiddenDjs(true)}>
            Show Hidden Submissions ({event.signups.filter(isHidableSubmission).length})
          </Button>
      }

    </Stack>
  </Container>
}


export { EventDjSignups }

