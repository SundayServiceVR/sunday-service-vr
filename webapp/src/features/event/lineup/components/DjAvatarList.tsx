import React from "react";
import { DocumentReference } from "firebase/firestore";
import { useEventDjCache } from "../../../../contexts/useEventDjCache";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

type Props = {
  djRefs: DocumentReference[]; // Require djRefs and remove djs
};

const DjAvatarList: React.FC<Props> = ({ djRefs }) => {
  const { djCache } = useEventDjCache();

  const renderTooltip = (props: React.HTMLAttributes<HTMLDivElement>, discordName: string) => (
    <Tooltip id="button-tooltip" {...props}>
      {discordName}
    </Tooltip>
  );

  const renderAvatar = (discord_id: string, public_name: string, avatarUrl: string) => (
    <OverlayTrigger
      key={discord_id}
      placement="top"
      overlay={renderTooltip({}, public_name)}
    >
      <a
        href={`https://discord.com/users/${discord_id}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          zIndex: 1,
        }}
      >
        <img
          src={avatarUrl}
          alt=""
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

  console.log("DjAvatarList djRefs:", djRefs);

  if (!djRefs || djRefs.length === 0) {
    console.error("djRefs is undefined or empty", djRefs);
    return <span>-</span>;
  }

  return (
    <div className="d-flex align-items-center" style={{ position: "relative" }}>
      {djRefs.map((djRef, index) => {
        const dj = djCache.get(djRef.id);
        if (!dj) return null;
        const avatarUrl = dj.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`;
        console.log("Rendering DJ from djRefs:", { discord_id: dj.discord_id, public_name: dj.public_name, avatarUrl });
        return (
          <div
            key={djRef.id}
            style={{
              marginLeft: index === 0 ? "0" : "-15px", // Overlap effect
              zIndex: djRefs.length - index, // Ensure proper stacking order
            }}
          >
            {renderAvatar(dj.discord_id, dj.public_name, avatarUrl)}
          </div>
        );
      })}
    </div>
  );
};

export default DjAvatarList;
