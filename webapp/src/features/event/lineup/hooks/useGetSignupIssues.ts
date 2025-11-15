import { useEventDjCache } from "../../../../contexts/useEventDjCache";
import { SignupIssue } from "../components/IssuePopoverIcon";
import { Event, EventSignup } from "../../../../util/types";

/**
 * Returns a function that takes an EventSignup and returns an array of SignupIssue objects.
 */
interface SignupIssueHandlers {
  onUpdateSignup: (signup: EventSignup) => void;
  openB2BModal: (signup: EventSignup) => void;
}

export function useGetSignupIssues({ onUpdateSignup, openB2BModal }: SignupIssueHandlers) {
  const { getEventsByDjId } = useEventDjCache();

  return (signup: EventSignup, event: Event): SignupIssue[] => {
    const issues: SignupIssue[] = [];

    // Debut issue
    if (signup.dj_refs && signup.dj_refs.length > 0) {
      if (!signup.is_debut) {
        // If not marked as debut but no previous events, flag possible debut
        signup.dj_refs.forEach((ref) => {
          const events = getEventsByDjId(ref.id).filter((e) => e.id !== event.id);
          if (events.length === 0) {
            issues.push({
              id: `debut-${ref.id}`,
              title: "Possible Debut",
              message:
                "Looks like this DJ hasn't performed before. If this is the case, set the debut option on the signup.",
              actionLabel: "Mark as Debut",
              action: () => onUpdateSignup({ ...signup, is_debut: !signup.is_debut }),
            });
          }
        });
      } else {
        // If marked as debut but there are previous plays (excluding the current event), flag it
        signup.dj_refs.forEach((ref) => {
          const events = getEventsByDjId(ref.id).filter((e) => e.id !== event.id);
          if (events.length > 0) {
            issues.push({
              id: `debut-contradiction-${ref.id}`,
              title: "Marked as Debut",
              message:
                "This DJ is marked as a debut but has previous plays. Verify the debut flag.",
              actionLabel: "Unmark as Debut",
              action: () => onUpdateSignup({ ...signup, is_debut: !signup.is_debut }),
            });
          }
        });
      }
    }

    // B2B DJ issue
    if (signup.event_signup_form_data?.is_b2b) {
      // If b2b_members_response is empty or not all b2b DJs are added, warn
      if (signup.dj_refs.length < 2) {
        issues.push({
          id: `b2b-missing-${signup.uuid}`,
          title: "B2B DJ(s) Not Added",
          message:
            "Please make sure to add other B2B DJs to this slot to be tracked.",
          actionLabel: "Add DJ to Slot",
          action: () => openB2BModal(signup),
        });
      }
    }

    return issues;
  };
}
