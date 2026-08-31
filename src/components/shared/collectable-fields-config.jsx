import { useState } from "react";
import { Check, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ContentDialog from "@/components/dialog/content-dialog";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FIELD_TYPES = ["text", "email", "date"];
const FIELD_MODES = ["hidden", "optional", "required"];

const humanize = (value) =>
  String(value || "").replace(/\b\w/g, (character) => character.toUpperCase());

const createField = (fields) => {
  let fieldNumber = fields.length + 1;
  while (
    fields.some(
      (field) => field.label.toLowerCase() === `new field ${fieldNumber}`,
    )
  ) {
    fieldNumber += 1;
  }

  return {
    label: `New field ${fieldNumber}`,
    value: `custom_field_${Date.now()}_${fieldNumber}`,
    mode: "optional",
    type: "text",
  };
};

const CollectableFieldsConfig = ({
  icon,
  title,
  description,
  dialogTitle = title,
  dialogDescription = description,
  fields = [],
  isEnabled = false,
  isSaving = false,
  maxFields,
  onSave,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const visibleFields = fields.filter((field) => field.mode !== "hidden");

  return (
    <>
      <SectionCard icon={icon} title={title} description={description}>
        {visibleFields.length ? (
          <div className="flex flex-wrap gap-2">
            {visibleFields.map((field) => (
              <span
                key={field.value}
                className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
              >
                {field.label}
                {field.mode === "required" && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
            No information fields are currently visible.
          </div>
        )}

        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary"
        >
          Configure fields <ChevronRight className="size-3.5" />
        </button>
      </SectionCard>

      {dialogOpen && (
        <CollectableFieldsDialog
          open
          onClose={() => setDialogOpen(false)}
          title={dialogTitle}
          description={dialogDescription}
          fields={fields}
          isEnabled={isEnabled}
          isSaving={isSaving}
          maxFields={maxFields}
          onSave={onSave}
        />
      )}
    </>
  );
};

function CollectableFieldsDialog({
  open,
  onClose,
  title,
  description,
  fields,
  isEnabled,
  isSaving,
  maxFields,
  onSave,
}) {
  const [draft, setDraft] = useState(fields);

  const update = (value, patch) =>
    setDraft((current) =>
      current.map((field) =>
        field.value === value ? { ...field, ...patch } : field,
      ),
    );

  const save = async () => {
    const normalizedFields = draft.map((field) => ({
      label: field.label.trim(),
      value: field.value,
      mode: field.mode,
      type: field.type,
    }));
    const labels = normalizedFields.map((field) => field.label.toLowerCase());
    const values = normalizedFields.map((field) => field.value);

    if (normalizedFields.some((field) => !field.label)) {
      toast.error("Every field needs a label.");
      return;
    }
    if (new Set(labels).size !== labels.length) {
      toast.error("Field labels must be unique.");
      return;
    }
    if (new Set(values).size !== values.length) {
      toast.error("Field identifiers must be unique.");
      return;
    }
    if (
      isEnabled &&
      normalizedFields.every((field) => field.mode === "hidden")
    ) {
      toast.error(
        "Keep at least one field visible while collection is enabled.",
      );
      return;
    }

    const saved = await onSave(normalizedFields);
    if (saved !== false) onClose();
  };

  const atFieldLimit = maxFields !== undefined && draft.length >= maxFields;

  return (
    <ContentDialog
      open={open}
      onOpenChange={(next) => !next && !isSaving && onClose()}
      title={title}
      description={description}
      footer={
        <div className="flx gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isSaving}>
            {isSaving ? <span className="spinner spinner-white" /> : <Check />}
            Save fields
          </Button>
        </div>
      }
    >
      <div className="px-6 py-5">
        {maxFields !== undefined && (
          <p className="text-xs font-semibold text-muted-foreground">
            {draft.length} of {maxFields} fields used
          </p>
        )}

        {draft.length ? (
          <div className="mt-4 space-y-3">
            {draft.map((field) => (
              <div
                key={field.value}
                className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-[minmax(0,1fr)_140px_140px_auto] sm:items-end"
              >
                <div className="min-w-0">
                  <label
                    htmlFor={`field-label-${field.value}`}
                    className="mb-1.5 block text-[10px] font-medium text-muted-foreground"
                  >
                    Field label
                  </label>
                  <input
                    id={`field-label-${field.value}`}
                    value={field.label}
                    maxLength={100}
                    disabled={isSaving}
                    onChange={(event) =>
                      update(field.value, { label: event.target.value })
                    }
                    className="h-9 w-full rounded-xl border bg-background px-3 text-xs font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-medium text-muted-foreground">
                    Type
                  </label>
                  <Select
                    value={field.type}
                    onValueChange={(type) => update(field.value, { type })}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="h-9 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {humanize(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-medium text-muted-foreground">
                    Mode
                  </label>
                  <Select
                    value={field.mode}
                    onValueChange={(mode) => update(field.value, { mode })}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="h-9 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {humanize(mode)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={isSaving}
                  onClick={() =>
                    setDraft((current) =>
                      current.filter((item) => item.value !== field.value),
                    )
                  }
                  aria-label={`Delete ${field.label}`}
                  title="Delete field"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-5 text-center">
            <p className="text-sm font-semibold">No collection fields</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a field to start collecting information from visitors.
            </p>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          disabled={isSaving || atFieldLimit}
          onClick={() =>
            setDraft((current) => [...current, createField(current)])
          }
          className="mt-5"
        >
          <Plus /> Add field
        </Button>
      </div>
    </ContentDialog>
  );
}

export default CollectableFieldsConfig;
