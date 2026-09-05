const avatarTones = [
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
];

function displayName(session) {
  return (
    session?.user_data?.name?.trim() ||
    session?.lead?.name?.trim() ||
    session?.visitor_name?.trim() ||
    "Unknown visitor"
  );
}

function initials(name) {
  if (name === "Unknown visitor") return "UV";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function avatarTone(id = "") {
  const hash = [...String(id)].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return avatarTones[hash % avatarTones.length];
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
    initials: initials(name),
    avatarTone: avatarTone(session.id),
    channel: channelLabel(session.channel),
    status: session.status || "active",
    assignedTo: session.assigned_to || null,
    owner: assigned || (session.ai_enabled === false ? "Unassigned" : "AI"),
    online: Boolean(
      session.is_recently_active || session.is_online || session.online,
    ),
    lastSeen: formatDate(session.last_activity_at || session.updated_at),
    email: session.user_data?.email || "Not collected",
    phone: session.user_data?.phone || "Not collected",
    location:
      session.user_data?.detected_address ||
      session.user_data?.location ||
      [
        session.detected_city,
        session.user_data?.detected_country ||
          session.user_data?.detected_country_code ||
          session.detected_country ||
          session.detected_country_code,
      ]
        .filter(Boolean)
        .join(", ") ||
      "Not available",
    firstSeen: formatDate(session.created_at),
    currentPage:
      session.metadata?.page_url ||
      session.user_data?.page_url ||
      "Not available",
  };
}
