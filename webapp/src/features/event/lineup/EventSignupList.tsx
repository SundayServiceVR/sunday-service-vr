import { Container, Card, Stack } from "react-bootstrap"
import { Event, EventSignup } from "../../../util/types";
import { useEventDjCache } from "../../../contexts/eventDjCacheProvider";
import { ActionMenu } from "../../../components/actionMenu/ActionMenu";
import DjDetails from "./DjDetails";
import SignupDetails from "./SignupDetails";

type Props = {
  event: Event,
  onUpdateSignup: (signup: EventSignup) => void,
  onRemoveSignup: (signup: EventSignup) => void,
  onAddSlotToLineup: (signup: EventSignup) => void,
}

const EventSignupList = ({ event, onUpdateSignup, onAddSlotToLineup, onRemoveSignup }: Props) => {


  const isHiddenSubmission = (signup: EventSignup) => {

    if(!signup.dj_refs || signup.dj_refs.length === 0) {
      return false;
    }

    return event.slots.map(slot => slot.signup_uuid).includes(signup.uuid)
  }

  const { djCache } = useEventDjCache();

  return <Container className="px-0 pb-3">
    <Stack gap={3}>
      {event.signups.filter((signup) => !isHiddenSubmission(signup)).map(
        (signup) => {

          const dj = signup.dj_refs && djCache.get(signup.dj_refs[0]?.id);

          if(!dj) {
            throw new Error("dj is missing from 'dj_refs'")
          }

          return <Card key={`signup-${signup.uuid}`}>
            <Card.Header>
              <Stack direction="horizontal" gap={1}>
                <div className="lead">
                  {dj?.dj_name ?? signup.name}
                </div>
                <div className="ms-auto"></div>
                <ActionMenu options={[
                  {
                    label: "Add To Lineup",
                    onClick: () => {
                      onAddSlotToLineup(signup)
                    }
                  },
                  // {
                  //   label: "Edit DJ",
                  //   // icon: faIdCard,
                  //   onClick: () => {
                  //     window.open(`/djs/${signup.dj_ref.id}`, '_blank', 'noreferrer')?.focus();
                  //   },
                  // },
                  {
                    label: "Remove Signup",
                    // icon: faX,
                    onClick: () => {
                      onRemoveSignup(signup);
                    }
                  }
                ]} />
              </Stack>
            </Card.Header>
            <Card.Body>
              <DjDetails dj={dj} />
              <hr />
              <SignupDetails signup={signup} onUpdateSignup={onUpdateSignup}/>
            </Card.Body>
          </Card>
        }
      )
    }
    </Stack>
  </Container>
}


export { EventSignupList as EventDjSignups }

