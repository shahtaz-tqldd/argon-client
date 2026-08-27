import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ToggleControl({
  checked,
  onChange,
  disabled = false,
  label = "Toggle setting",
  bgcolor = "bg-primary",
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition",
        checked ? bgcolor : "bg-muted-foreground/25",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

export function SectionCard({
  icon,
  title,
  description,
  onEdit,
  children,
  className,
}) {
  const SectionIcon = icon;

  return (
    <Card className={cn("flex h-full flex-col p-0", className)}>
      <div className="flex items-start justify-between gap-4 border-b p-5">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <SectionIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {onEdit && (
          <Button
            onClick={onEdit}
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${title}`}
          >
            <Pencil />
          </Button>
        )}
      </div>
      <div className="flex-1 p-5">{children}</div>
    </Card>
  );
}

export function ValueRow({ label, value, children }) {
  return (
    <div className="flex items-start justify-between gap-5 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children || (
        <span className="max-w-[62%] text-right text-xs font-semibold">
          {value}
        </span>
      )}
    </div>
  );
}
