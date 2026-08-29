import { cn } from "@/lib/utils";

const Toggle = ({ checked, onChange, disabled = false, label }) => {
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
        checked ? "bg-primary" : "bg-muted-foreground/25",
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
};

export { Toggle };
