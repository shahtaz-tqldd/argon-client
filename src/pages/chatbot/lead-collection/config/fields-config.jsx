import {
  Asterisk,
  Check,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { Badge, EmBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toSnakeCase } from "@/lib/utils";

import {
  createCustomFieldKey,
  MODE_OPTIONS,
  STANDARD_FIELDS,
} from "./config-utils";

const RequiredMarker = () => (
  <Asterisk
    className="size-3 shrink-0 text-red-500"
    aria-label="Required field"
  />
);

const ModeSelect = ({ value, onValueChange, disabled = false }) => (
  <Select value={value} onValueChange={onValueChange} disabled={disabled}>
    <SelectTrigger
      className="w-fit rounded-full bg-card text-xs font-semibold"
      aria-label="Field mode"
    >
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {MODE_OPTIONS.map((mode) => (
        <SelectItem key={mode.value} value={mode.value}>
          {mode.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const FieldsConfig = ({
  fields,
  setFields,
  hasChanges,
  isFetching,
  isUpdating,
  onSave,
}) => {
  const visibleFields = [
    ...STANDARD_FIELDS.map((field) => ({
      id: field.key,
      label: field.label,
      mode: fields[field.key],
    })),
    ...fields.custom_fields.map((field, index) => ({
      id: field._key,
      label: field.label.trim() || `Custom field ${index + 1}`,
      mode: field.mode,
    })),
  ]
    .filter((field) => field.mode !== "hidden")
    .sort((first, second) => {
      if (first.mode === second.mode) return 0;
      return first.mode === "required" ? -1 : 1;
    });

  const updateStandardField = (key, mode) => {
    setFields((current) => ({ ...current, [key]: mode }));
  };

  const updateCustomField = (fieldKey, changes) => {
    setFields((current) => ({
      ...current,
      custom_fields: current.custom_fields.map((field) =>
        field._key === fieldKey ? { ...field, ...changes } : field,
      ),
    }));
  };

  const addCustomField = () => {
    setFields((current) => ({
      ...current,
      custom_fields: [
        ...current.custom_fields,
        {
          _key: createCustomFieldKey(),
          label: "",
          value: "",
          mode: "optional",
        },
      ],
    }));
  };

  const removeCustomField = (fieldKey) => {
    setFields((current) => ({
      ...current,
      custom_fields: current.custom_fields.filter(
        (field) => field._key !== fieldKey,
      ),
    }));
  };

  return (
    <Card className="p-0">
      <div className="border-b p-5">
        <SectionTitle
          title="Lead collection"
          details="Choose which information to request from visitors."
        />
      </div>

      <div className="border-b bg-muted/20 px-5 py-4">
        <p className="text-xs font-semibold">Fields to collect</p>
        {visibleFields.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {visibleFields.map((field) => (
              <span key={field.id} className="flex items-center gap-0.5">
                <EmBadge
                  className={field.mode === "required" ? "pl-2 pr-3" : ""}
                >
                  {field.mode === "required" && <RequiredMarker />}
                  {field.label}
                </EmBadge>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            No fields are currently visible.
          </p>
        )}
      </div>

      <div className="mt-5 px-5">
        <SectionTitle
          title="Standard fields"
          details="Hidden fields are not included in lead collection."
        />
        <div className="mt-3 divide-y rounded-2xl border">
          {STANDARD_FIELDS.map((field) => {
            const isRequired = fields[field.key] === "required";

            return (
              <div
                key={field.key}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold">{field.label}</p>
                    {isRequired && <RequiredMarker />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {field.description}
                  </p>
                </div>
                <ModeSelect
                  value={fields[field.key]}
                  onValueChange={(mode) => updateStandardField(field.key, mode)}
                  disabled={isUpdating}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 px-5">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle
            title="Custom fields"
            details="Add any extra information your team needs."
          />
          <Button
            size="sm"
            variant="outline"
            onClick={addCustomField}
            disabled={isUpdating}
          >
            <Plus />
            Add field
          </Button>
        </div>

        {fields.custom_fields.length ? (
          <div className="mt-3 space-y-4 rounded-2xl border p-4">
            {fields.custom_fields.map((field, index) => (
              <div
                key={field._key}
                className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <Input
                    value={field.label}
                    placeholder={`Custom field ${index + 1}`}
                    aria-label={`Custom field ${index + 1} label`}
                    onChange={(event) => {
                      const label = event.target.value;
                      updateCustomField(field._key, {
                        label,
                        value: toSnakeCase(label),
                      });
                    }}
                    disabled={isUpdating}
                  />
                  {field.mode === "required" && <RequiredMarker />}
                </div>
                <ModeSelect
                  value={field.mode}
                  onValueChange={(mode) =>
                    updateCustomField(field._key, { mode })
                  }
                  disabled={isUpdating}
                />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-red-600"
                  aria-label={`Remove ${field.label || "custom field"}`}
                  onClick={() => removeCustomField(field._key)}
                  disabled={isUpdating}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed px-4 py-6 text-center">
            <p className="text-xs font-medium">No custom fields added</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Add a field to collect information beyond the standard contact
              details.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-end gap-3 border-t px-5 py-4">
        {isFetching && !isUpdating && (
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <RefreshCw className="size-3 animate-spin" />
            Refreshing
          </span>
        )}
        <Button onClick={onSave} disabled={!hasChanges || isUpdating}>
          {isUpdating ? <span className="spinner spinner-white" /> : <Check />}
          Save fields
        </Button>
      </div>
    </Card>
  );
};

export default FieldsConfig;
