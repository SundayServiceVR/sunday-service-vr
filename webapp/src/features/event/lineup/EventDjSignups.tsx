import { collection, documentId, DocumentReference, getDocs, query, where } from "firebase/firestore";
import { Button, Container, Card, Stack, Row, Col, ListGroup } from "react-bootstrap"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarPlus, faX, faIdCard, faEyeSlash, faEye, faCalendarXmark } from '@fortawesome/free-solid-svg-icons'
import { Dj, Event } from "../../../util/types";
import { useEffect, useState } from "react";
import { docToRawType } from "../../../store/util";
import { db } from "../../../util/firebase";
import { ActionMenu } from "../../../components/actionMenu/ActionMenu";

type Props = {
  dj_refs: DocumentReference[];
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

const EventDjSignups = ({ dj_refs, event, onAddDjToLineup, onRemoveDjFromSignups, onRemoveDjFromLineup }: Props) => {

  const [djCache, setDjCache] = useState<DjInfoCache>({});

  const [showHiddenDjs, setShowHiddenDjs] = useState(false);

  useEffect(() => {

    if (dj_refs.length === 0) {
      setDjCache({});
      return;
    }

    (async () => {
      // I'd bank there's a better way to fetch these
      const q = query(collection(db, "djs"), where(documentId(), "in", dj_refs.map(ref => ref.id)));
      const querySnapshot = await getDocs(q);
      const newDjCache: DjInfoCache = {};

      querySnapshot.docs
        .forEach((doc) => {
          newDjCache[doc.ref.id] = {
            dj: docToRawType<Dj>(doc),
          }
        });
      setDjCache(newDjCache);
    })()
  }, [dj_refs])

  return <Container className="px-0 pb-3">
    <Stack gap={3}>
      {dj_refs.map(
        (dj_ref) => (
          <Card key={dj_ref.id}>
            <Card.Header>
              <Stack direction="horizontal" gap={1}>
                <div className="lead">{djCache[dj_ref.id]?.dj.dj_name ?? dj_ref.id}</div>
                <div className="ms-auto"></div>
                <ActionMenu options={[
                  {
                    label: "Edit DJ",
                    icon: faIdCard,
                    onClick: () => {
                      window.open(`/djs/${dj_ref.id}`, '_blank', 'noreferrer')?.focus();
                    },
                  },
                  {
                    label: "Remove Signup",
                    icon: faX,
                    onClick: () => {
                      onRemoveDjFromSignups(dj_ref);
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
                    <div>Notes: They don't use the low pass on the mic</div>
                  </Col>
                  <Col>
                    <div>Recent Events (13)</div>
                    <ListGroup>
                      <ListGroup.Item>date-1</ListGroup.Item>
                      <ListGroup.Item>date-2</ListGroup.Item>
                      <ListGroup.Item>date-3</ListGroup.Item>
                      <ListGroup.Item>See 10 More...</ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>
              </Container>
            </Card.Body>
            <Card.Footer>
              <Container>
                <Row>
                  <Col className="text-center">
                    {event.slots.map(slot => slot.dj_ref.id).includes(dj_ref.id)
                      ? <Button variant="tertiary" onClick={() => onRemoveDjFromLineup(dj_ref)}><FontAwesomeIcon icon={faCalendarXmark} /> Remove from Lineup</Button>
                      : <Button variant="tertiary" onClick={() => onAddDjToLineup(dj_ref, djCache[dj_ref.id]?.dj.dj_name ?? "Unknown Name", true)}><FontAwesomeIcon icon={faCalendarPlus} /> Add to Lineup</Button>}

                  </Col>
                  {
                    !event.slots.map(slot => slot.dj_ref.id).includes(dj_ref.id) && <Col className="text-center">
                      {event.slots.map(slot => slot.dj_ref.id).includes(dj_ref.id)
                        ? <Button variant="tertiary" onClick={() => { }}><FontAwesomeIcon icon={faEyeSlash} />Hide</Button>
                        : <Button variant="tertiary" onClick={() => { }}><FontAwesomeIcon icon={faEye} />Unhide</Button>}
                    </Col>
                  }

                </Row>
              </Container>
            </Card.Footer>
          </Card>
        )
      )}

      {
        showHiddenDjs
          ? <Button variant="secondary" onClick={() => setShowHiddenDjs(false)}>
            Unshow Hidden Submissions
          </Button>
          : <Button variant="secondary" onClick={() => setShowHiddenDjs(true)}>
            Show Hidden Submissions
          </Button>
      }

    </Stack>
  </Container>
}

export { EventDjSignups }

