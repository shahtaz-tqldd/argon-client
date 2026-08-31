import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Pencil,
  Plus,
  UserRoundCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/card";
import ContentDialog from "@/components/dialog/content-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Toggle } from "@/components/ui/toggle";
import { initialBookingFields } from "../demo-data";

const InfoCollect = () => {
  const [fields, setFields] = useState(initialBookingFields);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const enabledFields = fields.filter((field) => field.enabled);
  return (
    <>
      <SectionCard
        icon={UserRoundCheck}
        title="Information to collect"
        description="Fields requested before an appointment is confirmed."
        action={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setFieldsOpen(true)}
          >
            <Pencil />
          </Button>
        }
      >
        <div className="flex flex-wrap gap-2">
          {enabledFields.map((field) => (
            <span
              key={field.id}
              className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
            >
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </span>
          ))}
        </div>
        <button
          onClick={() => setFieldsOpen(true)}
          className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary"
        >
          Configure fields <ChevronRight className="size-3.5" />
        </button>
      </SectionCard>
      <BookingFieldsDialog
        open={fieldsOpen}
        onClose={() => setFieldsOpen(false)}
        fields={fields}
        setFields={setFields}
      />
    </>
  );
};

function BookingFieldsDialog({ open, onClose, fields, setFields }) {
  const [draft, setDraft] = useState(fields);
  const update = (id, key, value) =>
    setDraft((current) =>
      current.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    );
  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= draft.length) return;
    setDraft((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const save = () => {
    setFields(draft);
    toast.success("Booking form fields saved");
    onClose();
  };
  return (
    <ContentDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title="Booking information"
      description="Choose what the chatbot should collect before confirming an appointment."
      footer={
        <div className="flx gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>
            <Check />
            Save fields
          </Button>
        </div>
      }
    >
      <div className="px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Form fields</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag order is represented with the arrow controls.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setDraft((current) => [
                ...current,
                {
                  id: `custom-${Date.now()}`,
                  label: "Custom question",
                  type: "Text",
                  enabled: true,
                  required: false,
                },
              ])
            }
          >
            <Plus />
            Add field
          </Button>
        </div>
        <div className="space-y-2">
          {draft.map((field, index) => (
            <div
              key={field.id}
              className={cn(
                "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3",
                !field.enabled && "opacity-55",
              )}
            >
              <div className="flex flex-col">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="text-muted-foreground disabled:opacity-20"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === draft.length - 1}
                  className="text-muted-foreground disabled:opacity-20"
                >
                  <ArrowDown className="size-3.5" />
                </button>
              </div>
              <div className="min-w-0">
                <input
                  value={field.label}
                  onChange={(event) =>
                    update(field.id, "label", event.target.value)
                  }
                  className="w-full bg-transparent text-xs font-semibold outline-none"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {field.type}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Checkbox
                    checked={field.required}
                    disabled={!field.enabled}
                    onCheckedChange={(value) =>
                      update(field.id, "required", value === true)
                    }
                  />
                  Required
                </label>
                <Toggle
                  checked={field.enabled}
                  disabled={field.locked}
                  onChange={(value) => update(field.id, "enabled", value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ContentDialog>
  );
}

export default InfoCollect;
