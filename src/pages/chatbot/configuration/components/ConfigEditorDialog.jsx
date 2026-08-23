import { useState } from "react";
import { Check, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { FloatingTextarea } from "@/components/ui/textarea";
import { LANGUAGES } from "@/constants/language";
import { TIMEZONES } from "@/lib/timezone";

import { ToggleControl } from "./shared";

const editorDefinitions = {
  details: {
    title: "Edit chatbot details",
    description: "Update the identity and regional settings for this chatbot.",
    fields: [
      { key: "logo", label: "Chatbot logo", type: "image" },
      { key: "name", label: "Chatbot name" },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "language",
        label: "Language",
        type: "select",
        options: LANGUAGES,
      },
      {
        key: "timezone",
        label: "Timezone",
        type: "select",
        options: TIMEZONES.map((timezone) => ({
          value: timezone,
          label: timezone.replaceAll("_", " "),
        })),
      },
    ],
  },
  ai: {
    title: "Edit AI behavior",
    description: "Control AI replies, instructions, and response tone.",
    fields: [
      {
        key: "aiEnabled",
        label: "Enable AI replies",
        type: "toggle",
        help: "Allow the chatbot to respond automatically using AI.",
      },
      { key: "instructions", label: "AI instructions", type: "textarea" },
      {
        key: "tone",
        label: "Tone",
        type: "select",
        options: ["Professional", "Friendly", "Empathetic", "Direct"],
      },
    ],
  },
  escalation: {
    title: "Edit escalation rules",
    description: "Tell Argon when a human teammate should take over.",
    fields: [
      {
        key: "escalationRule",
        label: "Escalate when",
        type: "textarea",
      },
      {
        key: "neverAnswer",
        label: "Topics AI should not answer",
        type: "textarea",
      },
    ],
  },
  messages: {
    title: "Edit conversation messages",
    description: "Set the messages visitors see at key moments.",
    fields: [
      {
        key: "welcome",
        label: "Welcome message",
        type: "textarea",
      },
      {
        key: "fallback",
        label: "Fallback response",
        type: "textarea",
      },
    ],
  },
  appearance: {
    title: "Edit widget appearance",
    description: "Customize the embedded chatbot to match your brand.",
    fields: [
      { key: "primaryColor", label: "Primary color", type: "color" },
      { key: "logo", label: "Widget logo", type: "image" },
      { key: "greeting", label: "Greeting", type: "textarea" },
      { key: "launcherText", label: "Launcher text" },
      { key: "headerTitle", label: "Header title" },
      {
        key: "theme",
        label: "Theme",
        type: "select",
        options: ["Light", "Dark", "System"],
      },
      {
        key: "showBranding",
        label: "Show “Powered by Argon” branding",
        type: "toggle",
      },
    ],
  },
  targeting: {
    title: "Edit allowed URLs",
    description:
      "Control where the widget is displayed or explicitly disabled.",
    fields: [
      {
        key: "enabledEverywhere",
        label: "Enable on every page by default",
        type: "toggle",
      },
      {
        key: "allowedUrls",
        label: "Allowed URLs — one per line",
        type: "textarea",
      },
      {
        key: "disabledUrls",
        label: "Disable on these URLs — one per line",
        type: "textarea",
      },
    ],
  },
  facebook: {
    title: "Configure Facebook",
    description:
      "Connect a Facebook Page so Argon can answer Messenger conversations.",
    fields: [
      { key: "account", label: "Facebook Page" },
      {
        key: "status",
        label: "Connection status",
        type: "select",
        options: ["Connected", "Disconnected"],
      },
    ],
  },
  instagram: {
    title: "Configure Instagram",
    description:
      "Connect your professional Instagram account and handle direct messages.",
    fields: [
      { key: "account", label: "Instagram username" },
      {
        key: "status",
        label: "Connection status",
        type: "select",
        options: ["Connected", "Needs attention", "Disconnected"],
      },
    ],
  },
  whatsapp: {
    title: "Configure WhatsApp",
    description: "Connect your WhatsApp Business number to the shared inbox.",
    fields: [
      { key: "account", label: "WhatsApp Business number" },
      {
        key: "status",
        label: "Connection status",
        type: "select",
        options: ["Connected", "Disconnected"],
      },
    ],
  },
};

const getOptionValue = (option) =>
  typeof option === "object" ? option.value : option;

const getOptionLabel = (option) =>
  typeof option === "object" ? option.label : option;

const ConfigEditorDialog = ({
  sectionKey,
  values,
  isSaving,
  onClose,
  onSave,
}) => {
  const definition = editorDefinitions[sectionKey];
  const [draft, setDraft] = useState(values);

  if (!definition) return null;

  const update = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (isSaving) return;
    onSave(sectionKey, draft);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !isSaving && onClose()}
    >
      <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader className="border-b bg-muted/30 px-6 py-6">
            <DialogTitle>{definition.title}</DialogTitle>
            <DialogDescription className="leading-6">
              {definition.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 px-6 py-6">
            {definition.fields.map((field) => {
              if (field.type === "textarea") {
                return (
                  <FloatingTextarea
                    key={field.key}
                    name={field.key}
                    label={field.label}
                    rows={4}
                    value={draft[field.key] ?? ""}
                    onChange={(event) => update(field.key, event.target.value)}
                    textareaClassName="min-h-28"
                    disabled={isSaving}
                  />
                );
              }

              if (field.type === "select") {
                const selectedOption = field.options.find(
                  (option) => getOptionValue(option) === draft[field.key],
                );

                return (
                  <FloatingSelect
                    key={field.key}
                    label={field.label}
                    value={draft[field.key]}
                    displayValue={
                      selectedOption
                        ? getOptionLabel(selectedOption)
                        : draft[field.key]
                    }
                    onValueChange={(value) => update(field.key, value)}
                    disabled={isSaving}
                    contentClassName={
                      field.key === "timezone" ? "max-h-72" : undefined
                    }
                  >
                    {field.options.map((option) => (
                      <SelectItem
                        key={getOptionValue(option)}
                        value={getOptionValue(option)}
                      >
                        {getOptionLabel(option)}
                      </SelectItem>
                    ))}
                  </FloatingSelect>
                );
              }

              if (field.type === "toggle") {
                return (
                  <div
                    key={field.key}
                    className="flex items-start justify-between gap-5 rounded-2xl border bg-muted/20 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{field.label}</p>
                      {field.help && (
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {field.help}
                        </p>
                      )}
                    </div>
                    <ToggleControl
                      checked={Boolean(draft[field.key])}
                      onChange={(value) => update(field.key, value)}
                      disabled={isSaving}
                      label={field.label}
                    />
                  </div>
                );
              }

              if (field.type === "color") {
                return (
                  <div
                    key={field.key}
                    className="flex items-center gap-3 rounded-2xl border p-3"
                  >
                    <input
                      type="color"
                      value={draft[field.key]}
                      onChange={(event) =>
                        update(field.key, event.target.value)
                      }
                      className="size-10 overflow-hidden rounded-xl border-0 bg-transparent p-0"
                      disabled={isSaving}
                    />
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {field.label}
                      </p>
                      <input
                        value={draft[field.key]}
                        onChange={(event) =>
                          update(field.key, event.target.value)
                        }
                        className="mt-0.5 w-full bg-transparent text-sm font-semibold uppercase outline-none"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                );
              }

              if (field.type === "image") {
                return (
                  <label
                    key={field.key}
                    className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed p-4 transition hover:border-primary hover:bg-primary/[0.03]"
                  >
                    <span className="flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                      {draft[field.key] ? (
                        <img
                          src={draft[field.key]}
                          alt="Uploaded logo preview"
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="size-5" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {draft[field.key] ? "Change image" : field.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        PNG, JPG or WebP · max 2 MB
                      </span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          setDraft((current) => ({
                            ...current,
                            [field.key]: URL.createObjectURL(file),
                            [`${field.key}File`]: file,
                          }));
                        }
                      }}
                      disabled={isSaving}
                    />
                  </label>
                );
              }

              return (
                <FloatingInput
                  key={field.key}
                  name={field.key}
                  label={field.label}
                  value={draft[field.key] ?? ""}
                  onChange={(event) => update(field.key, event.target.value)}
                  disabled={isSaving}
                />
              );
            })}
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Check />
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigEditorDialog;
