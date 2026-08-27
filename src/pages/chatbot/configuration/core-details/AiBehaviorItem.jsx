import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/typography";

const AiBehaviorItem = ({
  label,
  sectionKey,
  value,
  emptyValue,
  className,
  isSaving,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  const cancel = () => {
    setDraft(value || "");
    setIsEditing(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSaving) return;

    const saved = await onSave(draft);
    if (saved) setIsEditing(false);
  };

  const hasChanges = draft.trim() !== (value || "").trim();
  const inputId = `ai-behavior-${sectionKey}`;

  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-border",
        className,
      )}
      aria-busy={isSaving || undefined}
    >
      {isEditing ? (
        <form className="flex flex-1 flex-col" onSubmit={submit}>
          <label
            htmlFor={inputId}
            className="text-sm font-bold text-foreground"
          >
            {label}
          </label>
          <Textarea
            id={inputId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={emptyValue}
            className="mt-3 min-h-20 flex-1 resize-y bg-background leading-6 focus-visible:ring-transparent outline-none focus-visible:border-primary/50"
            disabled={isSaving}
            autoFocus
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancel}
              disabled={isSaving}
            >
              <X />
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSaving || !hasChanges}>
              <Check />
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <h5 className="text-sm font-bold">{label}</h5>
            <Button
              onClick={() => {
                setDraft(value || "");
                setIsEditing(true);
              }}
              variant="ghost"
              size="icon-xs"
              className="-mr-1 -mt-1 text-muted-foreground hover:text-primary"
              aria-label={`Edit ${label}`}
              disabled={isSaving}
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>
          <Text
            variant="sm"
            className={cn(
              "mt-2 line-clamp-3 leading-6 text-sm",
              value ? "" : "italic !text-slate-400",
            )}
          >
            {value || emptyValue}
          </Text>
        </>
      )}
    </div>
  );
};

export default AiBehaviorItem;
