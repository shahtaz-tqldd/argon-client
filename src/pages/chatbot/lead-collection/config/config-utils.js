export const getLeadCaptureConfig = (response) =>
  response?.data || response || null;

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
