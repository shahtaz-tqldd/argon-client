import { toSnakeCase } from "@/lib/utils";

export const MODE_OPTIONS = [
  { value: "hidden", label: "Hidden" },
  { value: "optional", label: "Optional" },
  { value: "required", label: "Required" },
];

export const STANDARD_FIELDS = [
  {
    key: "name_mode",
    label: "Name",
    description: "The visitor's full name.",
  },
  {
    key: "email_mode",
    label: "Email address",
    description: "A valid email address for follow-up.",
  },
  {
    key: "phone_mode",
    label: "Phone number",
    description: "A contact number, including country code.",
  },
  {
    key: "address_mode",
    label: "Address",
    description: "The visitor's location or mailing address.",
  },
];

export const STANDARD_FIELD_VALUES = new Set([
  "name",
  "email",
  "phone",
  "address",
]);

export const getLeadCaptureConfig = (response) =>
  response?.data || response || null;

export const createCustomFieldKey = () =>
  globalThis.crypto?.randomUUID?.() ||
  `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const normalizeConfigFields = (config) => ({
  name_mode: config?.name_mode || "hidden",
  email_mode: config?.email_mode || "hidden",
  phone_mode: config?.phone_mode || "hidden",
  address_mode: config?.address_mode || "hidden",
  custom_fields: Array.isArray(config?.custom_fields)
    ? config.custom_fields.map((field, index) => ({
        _key: field.id || `${field.value || "custom"}-${index}`,
        label: field.label || "",
        value: toSnakeCase(field.label || field.value),
        mode: field.mode || "hidden",
      }))
    : [],
});

export const getFieldsPayload = (fields) => ({
  name_mode: fields.name_mode,
  email_mode: fields.email_mode,
  phone_mode: fields.phone_mode,
  address_mode: fields.address_mode,
  custom_fields: fields.custom_fields.map(({ label, mode }) => ({
    label: label.trim(),
    value: toSnakeCase(label),
    mode,
  })),
});

export const normalizeCollectionSettings = (config) => ({
  auto_collect: Boolean(config?.auto_collect),
  intro_message: config?.intro_message || "",
  require_consent: Boolean(config?.require_consent),
  consent_message: config?.require_consent ? config?.consent_message || "" : "",
});

export const getCollectionSettingsPayload = (settings) => ({
  auto_collect: settings.auto_collect,
  intro_message: settings.intro_message.trim(),
  require_consent: settings.require_consent,
  consent_message: settings.require_consent
    ? settings.consent_message.trim()
    : "",
});

export const getChangedValues = (current, saved) =>
  Object.fromEntries(
    Object.entries(current).filter(
      ([key, value]) => JSON.stringify(value) !== JSON.stringify(saved[key]),
    ),
  );

export const hasChangedValues = (current, saved) =>
  Object.keys(getChangedValues(current, saved)).length > 0;
