export const LEAD_STATUSES = [
  "new",
  "qualified",
  "contacted",
  "converted",
  "disqualified",
];

export const statusStyles = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  qualified: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  converted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  disqualified: "bg-muted text-muted-foreground",
};

export const humanize = (value) =>
  String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const displayValue = (value) =>
  value === null || value === undefined || value === "" ? "—" : String(value);

export const unwrapData = (response) => response?.data ?? response;
