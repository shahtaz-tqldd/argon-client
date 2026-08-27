export const DEFAULT_WIDGET_SETTINGS = {
  isEnabled: true,
  primaryColor: "#3a86ff",
  secondaryColor: "#ff683a",
  launcherPosition: "bottom_right",
  launcherText: "",
  headerTitle: "",
  headerDescription: "",
  showBranding: true,
  theme: "light",
  otherSettings: {},
};

export const getWidgetDetails = (response) =>
  response?.data?.data || response?.data || response || {};

export const normalizeWidgetSettings = (details) => {
  const widget = details?.widget_settings || {};

  return {
    isEnabled: widget.is_enabled ?? DEFAULT_WIDGET_SETTINGS.isEnabled,
    primaryColor:
      widget.primary_color || DEFAULT_WIDGET_SETTINGS.primaryColor,
    secondaryColor:
      widget.secondary_color || DEFAULT_WIDGET_SETTINGS.secondaryColor,
    launcherPosition:
      widget.launcher_position || DEFAULT_WIDGET_SETTINGS.launcherPosition,
    launcherText:
      widget.launcher_text ?? DEFAULT_WIDGET_SETTINGS.launcherText,
    headerTitle: widget.header_title ?? DEFAULT_WIDGET_SETTINGS.headerTitle,
    headerDescription:
      widget.header_description ?? DEFAULT_WIDGET_SETTINGS.headerDescription,
    showBranding:
      widget.show_branding ?? DEFAULT_WIDGET_SETTINGS.showBranding,
    theme: widget.theme || DEFAULT_WIDGET_SETTINGS.theme,
    otherSettings: widget.other_settings || {},
  };
};

export const normalizeAllowedUrls = (allowedUrls) =>
  (Array.isArray(allowedUrls) ? allowedUrls : []).map((item, index) => ({
    key: item.id || `allowed-url-${index}`,
    id: item.id,
    url: item.url || "",
    isActive: item.is_active ?? true,
  }));

export const getWidgetSettingsPayload = (settings) => ({
  is_enabled: settings.isEnabled,
  primary_color: settings.primaryColor,
  secondary_color: settings.secondaryColor,
  launcher_position: settings.launcherPosition,
  launcher_text: settings.launcherText.trim(),
  header_title: settings.headerTitle.trim(),
  header_description: settings.headerDescription.trim(),
  show_branding: settings.showBranding,
  theme: settings.theme,
  other_settings: settings.otherSettings,
});

export const normalizeOrigin = (value) => {
  const input = value.trim();
  if (!input) return null;

  try {
    const parsed = new URL(input);
    const hasPath = parsed.pathname && parsed.pathname !== "/";

    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      hasPath ||
      parsed.search ||
      parsed.hash
    ) {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
};

export const getAllowedUrlsPayload = (allowedUrls) =>
  allowedUrls.map(({ id, url, isActive }) => ({
    ...(id ? { id } : {}),
    url: normalizeOrigin(url),
    is_active: isActive,
  }));
