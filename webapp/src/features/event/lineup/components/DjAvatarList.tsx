import React from "react";
import { DocumentReference } from "firebase/firestore";
import { useEventDjCache } from "../../../../contexts/useEventDjCache";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

type ReferenceLike = {
  id?: string;
  path?: string;
  _path?: { segments?: unknown };
};

function getRefId(ref: unknown): string | undefined {
  if (!ref || typeof ref !== "object") return undefined;
  const r = ref as ReferenceLike;
  if (typeof r.id === "string" && r.id) return r.id;

  const segments = r._path?.segments;
  if (Array.isArray(segments) && segments.length >= 2) {
    // Firestore path segments: [collection, docId, collection, docId, ...]
    return String(segments[segments.length - 1]);
  }
  if (typeof r.path === "string" && r.path) {
    const parts = r.path.split("/").filter(Boolean);
    return parts[parts.length - 1];
  }
  return undefined;
}

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


  if (!djRefs || djRefs.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className="d-flex align-items-center" style={{ position: "relative" }}>
      {djRefs.map((djRef, index) => {
        const djId = getRefId(djRef);
        if (!djId) return null;

        const dj = djCache.get(djId);
        if (!dj) return null;
        const avatarUrl = dj.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`;
        return (
          <div
            key={djId}
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
