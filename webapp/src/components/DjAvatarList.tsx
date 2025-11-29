import React from "react";
import { DocumentReference } from "firebase/firestore";
import { useEventDjCache } from "../contexts/useEventDjCache";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

type Props = {
  djRefs: DocumentReference[];
};

const DjAvatarList: React.FC<Props> = ({ djRefs }) => {
  const { djCache } = useEventDjCache();

  const renderTooltip = (props: React.HTMLAttributes<HTMLDivElement>, discordName: string) => (
    <Tooltip id="button-tooltip" {...props}>
      {discordName}
    </Tooltip>
  );

  return (
    <div className="d-flex align-items-center gap-2">
      {djRefs.map((djRef) => {
        const dj = djCache.get(djRef.id);
        if (!dj) return null;
        const avatarUrl = dj.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`;
        return (
          <OverlayTrigger
            key={dj.discord_id}
            placement="top"
            overlay={renderTooltip({}, dj.public_name)}
          >
            <a
              href={`https://discord.com/users/${dj.discord_id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                zIndex: 1,
              }}
            >
              <img
                src={avatarUrl}
                alt={dj.public_name}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              />
            </a>
          </OverlayTrigger>
        );
      })}
    </div>
  );
};

export default DjAvatarList;
