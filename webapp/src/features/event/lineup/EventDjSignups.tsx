import { collection, documentId, DocumentReference, getDocs, query, where } from "firebase/firestore";
import { Button, Container, ListGroup, Stack } from "react-bootstrap"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarPlus, faCalendarMinus, faX, faIdCard } from '@fortawesome/free-solid-svg-icons'
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

const EventDjSignups = ({ dj_refs, event, onAddDjToLineup, onRemoveDjFromSignups }: Props) => {


  const [djCache, setDjCache] = useState<DjInfoCache>({});

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

  return <Container className="px-0">
    <ListGroup>
      {dj_refs.map(
        (dj_ref) => (
          <ListGroup.Item key={dj_ref.id}>
            <Stack direction="horizontal" gap={1} >
              <div className="lead text-muted mb-1">{djCache[dj_ref.id]?.dj.dj_name ?? dj_ref.id}</div>
              <div className=" ms-auto"></div>
              <Button variant="tertiary" onClick={() => onAddDjToLineup(dj_ref, djCache[dj_ref.id]?.dj.dj_name ?? "Unknown Name", false)}><FontAwesomeIcon icon={faCalendarPlus}/></Button>
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
              ]}/>
              
            </Stack>

            Last 3 Plays:
            <ul>
              <li>date-1</li>
              <li>date-2</li>
              <li>date-3</li>
            </ul>
            <div>Total Plays: 8</div>
            <div>Availability: Blarg</div>
            <div>Type: Live</div>
            <div>Notes: They don't use the low pass on the mic</div>

          </ListGroup.Item>
        )
      )}
    </ListGroup>
  </Container>
}

export { EventDjSignups }

