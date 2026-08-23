const getDetectedTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

export const DETECTED_TIMEZONE = getDetectedTimezone();

const getSupportedTimezones = () => {
  try {
    const supportedTimezones = Intl.supportedValuesOf?.("timeZone") || [];
    return Array.from(
      new Set([DETECTED_TIMEZONE, "UTC", ...supportedTimezones]),
    ).sort((first, second) => first.localeCompare(second));
  } catch {
    return Array.from(new Set([DETECTED_TIMEZONE, "UTC"]));
  }
};

export const TIMEZONES = getSupportedTimezones();
