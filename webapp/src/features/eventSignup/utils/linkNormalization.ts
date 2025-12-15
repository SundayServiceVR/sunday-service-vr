// Utility helpers for working with stream links (VRCDN, Twitch, etc.)

/**
 * Normalize various VRCDN URL formats into a canonical `vrcdn:{username}` form.
 *
 * Supported examples:
 * - rtspt://stream.vrcdn.live/live/elaina          -> vrcdn:elaina
 * - https://stream.vrcdn.live/live/machinespirit   -> vrcdn:machinespirit
 * - https://stream.vrcdn.live/live/machinespirit.live.ts -> vrcdn:machinespirit
 * - rtmp://vrcdn.live/live/impulse                 -> vrcdn:impulse
 */
export const normalizeVrcdnLink = (raw: string | undefined | null): string | null => {
  if (!raw) return null;

  const value = raw.trim();
  if (!value) return null;

  // If it's already in canonical form, just return it
  const existingMatch = value.match(/^vrcdn:([a-zA-Z0-9_.-]+)$/);
  if (existingMatch) {
    return `vrcdn:${existingMatch[1]}`;
  }

  // Quick bail-out if it doesn't even mention vrcdn
  if (!/vrcdn/i.test(value)) {
    return null;
  }

  try {
    // Ensure we have a valid URL by adding protocol if the user omitted it
    const withProtocol = /^(https?:|rtmp:|rtsp:|rtspt:)/i.test(value)
      ? value
      : `https://${value}`;

    const url = new URL(withProtocol.replace(/^rtspt:/i, "rtsp:"));

    // We only care about vrcdn domains
    if (!/vrcdn\.live$/i.test(url.hostname) && !/^vrcdn\.live$/i.test(url.hostname)) {
      return null;
    }

    // Path is usually /live/{username}[.something]
    const parts = url.pathname.split("/").filter(Boolean);
    const usernamePart = parts[parts.length - 1];
    if (!usernamePart) return null;

    // Strip common file suffixes (e.g. .ts, .m3u8, .live.ts)
    const username = usernamePart
      .replace(/\.live\.ts$/i, "")
      .replace(/\.ts$/i, "")
      .replace(/\.m3u8$/i, "");

    if (!username) return null;

    return `vrcdn:${username}`;
  } catch {
    return null;
  }
};

/**
 * Normalize Twitch URLs/usernames into a canonical `twitch:{username}` form.
 *
 * Examples:
 * - https://www.twitch.tv/makuuselona1 -> twitch:makuuselona1
 * - twitch.tv/makuuselona1            -> twitch:makuuselona1
 * - makuuselona1                      -> twitch:makuuselona1 (if it looks like a bare username)
 * - twitch:makuuselona1               -> twitch:makuuselona1 (idempotent)
 */
export const normalizeTwitchLink = (raw: string | undefined | null): string | null => {
  if (!raw) return null;

  const value = raw.trim();
  if (!value) return null;

  // Already canonical
  const existingMatch = value.match(/^twitch:([a-zA-Z0-9_]+)$/);
  if (existingMatch) {
    return `twitch:${existingMatch[1]}`;
  }

  // If it looks like a Twitch URL or domain
  if (/twitch\.tv/i.test(value)) {
    try {
      const withProtocol = /^(https?:)/i.test(value) ? value : `https://${value}`;
      const url = new URL(withProtocol);

      if (!/twitch\.tv$/i.test(url.hostname) && !/\.twitch\.tv$/i.test(url.hostname)) {
        return null;
      }

      const parts = url.pathname.split("/").filter(Boolean);
      const username = parts[0];
      if (!username) return null;

      return `twitch:${username.toLowerCase()}`;
    } catch {
      return null;
    }
  }

  // Fallback: if they just typed something without spaces and typical username chars, treat as Twitch username
  if (/^[a-zA-Z0-9_]+$/.test(value)) {
    return `twitch:${value.toLowerCase()}`;
  }

  return null;
};

/**
 * Try all known normalizers and return the first canonical form, otherwise null.
 */
export const normalizeStreamLink = (raw: string | undefined | null): string | null => {
  return normalizeVrcdnLink(raw) || normalizeTwitchLink(raw);
};
