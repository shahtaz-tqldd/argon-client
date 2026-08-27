import { cn } from "@/lib/utils";

export function SourceStatus({ status }) {
  const processing = status === "Processing";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        processing
          ? "bg-amber-500/10 text-amber-600"
          : status === "Failed"
            ? "bg-red-500/10 text-red-600"
            : "bg-emerald-500/10 text-emerald-600",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full bg-current",
          processing && "animate-pulse",
        )}
      />
      {status}
    </span>
  );
}

export function SourceAvailability({ isEnabled }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        isEnabled
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-slate-100 text-slate-500",
      )}
    >
      {isEnabled ? "Enabled" : "Disabled"}
    </span>
  );
}
