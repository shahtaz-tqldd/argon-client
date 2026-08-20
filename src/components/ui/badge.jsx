import { cn, formatStatus } from "@/lib/utils";

const Badge = ({ status }) => {
  const normalized = status.toLowerCase();

  const styles = {
    completed: "bg-primary text-white ring-primary/20",
    approved: "bg-primary text-white ring-primary/20",
    published: "bg-primary text-white ring-primary/20",
    in_progress: "bg-primary/10 text-primary ring-primary/20",
    draft: "bg-gray-50 text-gray-600 ring-gray-500/20",
    cancelled: "bg-slate-100 text-slate-600 ring-slate-500/20",

    complete: "bg-primary/10 text-primary ring-primary/20",

    verified: "bg-blue-600/10 text-blue-600 ring-blue-600/10",
    unverified: "bg-gray-50 text-gray-600 ring-gray-500/20",
    incomplete: "bg-red-100 text-red-500 ring-red-500/10",

    active: "bg-primary/10 text-primary ring-primary/20",
    premium: "bg-purple-700 text-white ring-purple-700/20",
    suspended: "bg-amber-50 text-amber-700 ring-amber-600/20",
    deactivated: "bg-slate-100 text-slate-600 ring-slate-500/20",
    reject: "bg-red-100 text-red-600 ring-red-500/20",
    rejected: "bg-red-100 text-red-600 ring-red-500/20",
    deleted: "bg-red-100 text-red-600 ring-red-500/20",
  };

  const appliedStyle =
    styles[normalized] ?? "bg-slate-100 text-slate-600 ring-slate-500/20";

  const displayStatus = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset",
        appliedStyle,
      )}
    >
      {displayStatus}
    </span>
  );
};

const StatusBadge = ({ children }) => {
  const styles = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    draft: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    disabled: "bg-muted text-muted-foreground",
  };
  const normalizedStatus = String(children || "draft").toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold",
        styles[normalizedStatus] || styles.draft,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {formatStatus(normalizedStatus)}
    </span>
  );
};

export { Badge, StatusBadge };
