import { AVATAR_TONES } from "@/constants/colors";
import { getInitials } from "@/lib/utils";

function displayName(session) {
  return (
    session?.user_metadata?.name?.trim() ||
    session?.lead?.name?.trim() ||
    session?.visitor_name?.trim() ||
    "Unknown visitor"
  );
}

function avatarTone(id = "") {
  const hash = [...String(id)].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

function channelLabel(channel = "web_widget") {
  return (
    {
      web_widget: "Website",
      facebook: "Facebook",
      instagram: "Instagram",
      whatsapp: "WhatsApp",
    }[channel] || channel
  );
}

function formatDate(value, fallback = "Not available") {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? fallback
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export function buildConversation(summary, details) {
  const session = { ...(summary || {}), ...(details || {}) };
  const name = displayName(session);
  const assigned =
    session.assigned_to?.name ||
    session.assigned_agent?.name ||
    session.assignee?.name ||
    session.assigned_to_name;

  return {
    ...session,
    id: session.id,
    sessionId: session.session_id || session.id,
    name,
    initials: getInitials(name),
    avatarTone: avatarTone(session.id),
    channel: channelLabel(session.channel),
    status: session.status || "active",
    assignedTo: session.assigned_to || null,
    owner: assigned,
    online: Boolean(
      session.is_recently_active || session.is_online || session.online,
    ),
    lastSeen: formatDate(session.last_activity_at || session.updated_at),
    email: session.user_metadata?.email || "Not collected",
    phone: session.user_metadata?.phone || "Not collected",
    location:
      session.user_metadata?.detected_address ||
      session.user_metadata?.location ||
      [
        session.detected_city,
        session.user_metadata?.detected_country ||
          session.user_metadata?.detected_country_code ||
          session.detected_country ||
          session.detected_country_code,
      ]
        .filter(Boolean)
        .join(", ") ||
      "Not available",
    firstSeen: formatDate(session.created_at),
    currentPage: session.metadata?.page_url || "Not available",
  };
}
