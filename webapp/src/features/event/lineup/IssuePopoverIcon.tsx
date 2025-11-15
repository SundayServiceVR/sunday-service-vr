import { OverlayTrigger, Popover, Button } from "react-bootstrap";
import { AlertTriangle } from "react-feather";

type SignupIssue = {
  id: string;
  title: string;
  message: string;
  actionLabel?: string;
  action?: () => void;
};

type Props = {
  idSuffix: string;
  issues: SignupIssue[];
};

const IssuePopoverIcon = ({ idSuffix, issues }: Props) => {
  const popover = (
    <Popover id={`issue-popover-${idSuffix}`} style={{ maxWidth: 320 }}>
      <Popover.Header as="h3">Issues</Popover.Header>
      <Popover.Body>
        {issues.map((issue) => (
          <div key={issue.id} className="mb-2">
            <strong>{issue.title}</strong>
            <div>{issue.message}</div>
            {issue.action && issue.actionLabel && (
              <div className="mt-1">
                <Button size="sm" variant="outline-primary" onClick={issue.action}>
                  {issue.actionLabel}
                </Button>
              </div>
            )}
          </div>
        ))}
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger trigger={["hover", "focus"]} placement="top" overlay={popover}>
      <span
        role="button"
        tabIndex={0}
        aria-label="Signup issues — more info"
        className="text-warning d-inline-flex align-items-center"
        style={{ cursor: "pointer" }}
      >
        <AlertTriangle size={16} />
      </span>
    </OverlayTrigger>
  );
};

export type { SignupIssue };
export default IssuePopoverIcon;
