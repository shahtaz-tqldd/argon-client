import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/dialog/confirm-dialog";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  useChatbotWidgetDetailsQuery,
  useUpdateChatbotMutation,
  useUpdateChatbotWidgetMutation,
} from "@/features/chatbot/chatbotApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import AllowedUrlsForm from "./allowed-urls-form";
import WidgetAppearanceForm from "./widget-appearance-form";
import WidgetInstallation from "./widget-installation";
import WidgetPreview from "./widget-preview";
import {
  getAllowedUrlsPayload,
  getWidgetDetails,
  getWidgetSettingsPayload,
  normalizeAllowedUrls,
  normalizeOrigin,
  normalizeWidgetSettings,
} from "./widget-utils";

const getWidgetIdentity = (details) => ({
  name: details?.name || "",
  logo: details?.logo || "",
  welcomeMessage: details?.welcome_message || "",
  logoFile: null,
  clearLogo: false,
});

const getChatbotUpdatePayload = (identity) => {
  if (!identity.logoFile && !identity.clearLogo) {
    return { welcome_message: identity.welcomeMessage.trim() };
  }

  const payload = new FormData();
  payload.append("welcome_message", identity.welcomeMessage.trim());
  if (identity.logoFile) payload.append("logo", identity.logoFile);
  if (identity.clearLogo) payload.append("clear_logo", "true");
  return payload;
};

const APPEARANCE_SETTING_KEYS = [
  "primaryColor",
  "secondaryColor",
  "launcherPosition",
  "launcherText",
  "headerTitle",
  "headerDescription",
  "showBranding",
  "theme",
];

const getAppearanceSnapshot = (settings, identity) =>
  JSON.stringify({
    settings: Object.fromEntries(
      APPEARANCE_SETTING_KEYS.map((key) => [key, settings[key]]),
    ),
    logo: identity.logo,
    welcomeMessage: identity.welcomeMessage,
  });

const getAllowedUrlsSnapshot = (allowedUrls) =>
  JSON.stringify(
    allowedUrls.map(({ id, url, isActive }) => ({
      id: id || null,
      url,
      isActive,
    })),
  );

const WidgetConfiguration = ({
  chatbotSlug,
  details,
  isFetching,
  isError,
  error,
  refetch,
}) => {
  const initialSettings = normalizeWidgetSettings(details);
  const initialAllowedUrls = normalizeAllowedUrls(details.allowed_urls);
  const initialWidgetIdentity = getWidgetIdentity(details);
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [allowedUrls, setAllowedUrls] = useState(initialAllowedUrls);
  const [savedAllowedUrls, setSavedAllowedUrls] = useState(initialAllowedUrls);
  const [widgetIdentity, setWidgetIdentity] = useState(initialWidgetIdentity);
  const [savedWidgetIdentity, setSavedWidgetIdentity] =
    useState(initialWidgetIdentity);
  const [pendingAllowedUrlAction, setPendingAllowedUrlAction] = useState(null);
  const [updateWidget, { isLoading: isUpdatingWidget }] =
    useUpdateChatbotWidgetMutation();
  const [updateChatbot, { isLoading: isUpdatingChatbot }] =
    useUpdateChatbotMutation();
  const isUpdating = isUpdatingWidget || isUpdatingChatbot;
  const publicKey = details?.widget_settings?.public_key || "";
  const hasAppearanceChanges =
    getAppearanceSnapshot(settings, widgetIdentity) !==
    getAppearanceSnapshot(savedSettings, savedWidgetIdentity);
  const hasAllowedUrlChanges =
    getAllowedUrlsSnapshot(allowedUrls) !==
    getAllowedUrlsSnapshot(savedAllowedUrls);

  if (isError) {
    return (
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_480px]">
        <Card className="flex flex-wrap items-center justify-between gap-4 border-red-500/20 bg-red-500/[0.035] p-5">
          <div>
            <p className="text-sm font-semibold text-red-600">
              Unable to load widget settings
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {getApiErrorMessage(error, "Please try again later.")}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw />
            Retry
          </Button>
        </Card>
        <WidgetPreview settings={settings} chatbot={widgetIdentity} />
      </div>
    );
  }

  const updateWidgetConfiguration = async (payload, successMessage) => {
    try {
      const response = await updateWidget({ chatbotSlug, payload }).unwrap();
      toast.success(response?.message || successMessage);
      return getWidgetDetails(response);
    } catch (updateError) {
      toast.error(
        getApiErrorMessage(updateError, "Unable to update the chatbot widget."),
      );
      return false;
    }
  };

  const saveAppearance = async () => {
    const hexColorPattern = /^#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?$/;

    if (
      !hexColorPattern.test(settings.primaryColor) ||
      !hexColorPattern.test(settings.secondaryColor)
    ) {
      toast.error("Enter valid hexadecimal colors, such as #3a86ff.");
      return;
    }

    const [widgetResult, chatbotResult] = await Promise.allSettled([
      updateWidget({
        chatbotSlug,
        payload: { widget_settings: getWidgetSettingsPayload(settings) },
      }).unwrap(),
      updateChatbot({
        chatbotSlug,
        payload: getChatbotUpdatePayload(widgetIdentity),
      }).unwrap(),
    ]);

    if (widgetResult.status === "fulfilled") {
      const nextSettings = normalizeWidgetSettings(
        getWidgetDetails(widgetResult.value),
      );
      setSettings(nextSettings);
      setSavedSettings(nextSettings);
    }

    if (chatbotResult.status === "fulfilled") {
      const savedChatbot = getWidgetDetails(chatbotResult.value);
      const nextLogo = savedChatbot.logo ?? widgetIdentity.logo;

      if (
        widgetIdentity.logo.startsWith("blob:") &&
        nextLogo !== widgetIdentity.logo
      ) {
        URL.revokeObjectURL(widgetIdentity.logo);
      }

      const nextIdentity = {
        ...widgetIdentity,
        name: savedChatbot.chatbo_name || widgetIdentity.name,
        logo: nextLogo,
        welcomeMessage:
          savedChatbot.welcome_message ?? widgetIdentity.welcomeMessage,
        logoFile: null,
        clearLogo: false,
      };
      setWidgetIdentity(nextIdentity);
      setSavedWidgetIdentity(nextIdentity);
    }

    if (
      widgetResult.status === "fulfilled" &&
      chatbotResult.status === "fulfilled"
    ) {
      toast.success("Widget appearance updated");
      return;
    }

    const failedResult =
      widgetResult.status === "rejected" ? widgetResult : chatbotResult;
    toast.error(
      getApiErrorMessage(
        failedResult.reason,
        "Some widget appearance changes could not be saved.",
      ),
    );
  };

  const updateWidgetEnabled = async (isEnabled) => {
    const nextDetails = await updateWidgetConfiguration(
      { widget_settings: { is_enabled: isEnabled } },
      `Widget ${isEnabled ? "enabled" : "disabled"}`,
    );

    if (nextDetails) {
      const savedSettings = normalizeWidgetSettings(nextDetails);
      const applyEnabledState = (current) => ({
        ...current,
        isEnabled: savedSettings.isEnabled,
      });
      setSettings(applyEnabledState);
      setSavedSettings(applyEnabledState);
    }
  };

  const saveAllowedUrls = async () => {
    const normalizedUrls = allowedUrls.map((item) => normalizeOrigin(item.url));

    if (normalizedUrls.some((url) => !url)) {
      toast.error(
        "Enter valid HTTP(S) origins without paths, queries, or fragments.",
      );
      return;
    }

    if (new Set(normalizedUrls).size !== normalizedUrls.length) {
      toast.error("Each allowed URL can only be added once.");
      return;
    }

    const nextDetails = await updateWidgetConfiguration(
      { allowed_urls: getAllowedUrlsPayload(allowedUrls) },
      "Allowed URLs updated",
    );

    if (nextDetails) {
      const nextAllowedUrls = normalizeAllowedUrls(nextDetails.allowed_urls);
      setAllowedUrls(nextAllowedUrls);
      setSavedAllowedUrls(nextAllowedUrls);
    }
  };

  const confirmAllowedUrlAction = async () => {
    if (!pendingAllowedUrlAction) return;

    const { type, item } = pendingAllowedUrlAction;

    if (!item.id) {
      setAllowedUrls((current) =>
        type === "remove"
          ? current.filter((url) => url.key !== item.key)
          : current.map((url) =>
              url.key === item.key
                ? { ...url, isActive: !item.isActive }
                : url,
            ),
      );
      setPendingAllowedUrlAction(null);
      return;
    }

    const nextIsActive = !item.isActive;
    const payload =
      type === "remove"
        ? { removed_allowed_url_id: item.id }
        : {
            allowed_urls: [
              {
                id: item.id,
                is_active: nextIsActive,
              },
            ],
          };
    const nextDetails = await updateWidgetConfiguration(
      payload,
      type === "remove"
        ? "Allowed URL removed"
        : `Allowed URL ${nextIsActive ? "activated" : "deactivated"}`,
    );

    if (!nextDetails) return;

    const applyConfirmedAction = (current) =>
      type === "remove"
        ? current.filter((url) => url.id !== item.id)
        : current.map((url) =>
            url.id === item.id
              ? { ...url, isActive: nextIsActive }
              : url,
          );
    setAllowedUrls(applyConfirmedAction);
    setSavedAllowedUrls(applyConfirmedAction);
    setPendingAllowedUrlAction(null);
  };

  const pendingUrl = pendingAllowedUrlAction?.item;
  const isRemovingUrl = pendingAllowedUrlAction?.type === "remove";
  const nextUrlStatus = pendingUrl ? !pendingUrl.isActive : false;

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_480px]">
      <div className="space-y-5">
        <WidgetInstallation
          publicKey={publicKey}
          isEnabled={settings.isEnabled}
          onEnabledChange={updateWidgetEnabled}
          isSaving={isUpdating}
        />
        <WidgetAppearanceForm
          settings={settings}
          setSettings={setSettings}
          identity={widgetIdentity}
          setIdentity={setWidgetIdentity}
          onSave={saveAppearance}
          hasChanges={hasAppearanceChanges}
          isSaving={isUpdating}
        />
        <AllowedUrlsForm
          allowedUrls={allowedUrls}
          setAllowedUrls={setAllowedUrls}
          onSave={saveAllowedUrls}
          onRequestRemove={(item) =>
            setPendingAllowedUrlAction({ type: "remove", item })
          }
          onRequestStatusChange={(item) =>
            setPendingAllowedUrlAction({ type: "status", item })
          }
          hasChanges={hasAllowedUrlChanges}
          isSaving={isUpdating}
        />
        {isFetching && !isUpdating && (
          <p className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <RefreshCw className="size-3.5 animate-spin" />
            Refreshing widget settings…
          </p>
        )}
      </div>

      <WidgetPreview settings={settings} chatbot={widgetIdentity} />

      <ConfirmDialog
        open={Boolean(pendingAllowedUrlAction)}
        setOpen={(open) => {
          if (!open) setPendingAllowedUrlAction(null);
        }}
        title={
          isRemovingUrl
            ? "Remove allowed URL?"
            : `${nextUrlStatus ? "Activate" : "Deactivate"} allowed URL?`
        }
        description={
          isRemovingUrl
            ? `${pendingUrl?.url || "This origin"} will be removed from the widget's allowed URLs.`
            : nextUrlStatus
              ? `${pendingUrl?.url || "This origin"} will be allowed to load the widget.`
              : `${pendingUrl?.url || "This origin"} will no longer be allowed to load the widget.`
        }
        confirmText={
          isRemovingUrl
            ? "Remove URL"
            : nextUrlStatus
              ? "Activate"
              : "Deactivate"
        }
        confirmVariant={
          isRemovingUrl || !nextUrlStatus ? "destructive" : "default"
        }
        onConfirm={confirmAllowedUrlAction}
        isLoading={isUpdating}
      />
    </div>
  );
};

const WidgetLoadingState = () => (
  <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
    <div className="space-y-5">
      {[180, 480, 260].map((height) => (
        <Card key={height} className="animate-pulse p-5">
          <div className="h-5 w-40 rounded-full bg-slate-200" />
          <div className="mt-3 h-3 w-72 max-w-full rounded-full bg-slate-200" />
          <div className="mt-6 rounded-2xl bg-slate-100" style={{ height }} />
        </Card>
      ))}
    </div>
    <Card className="h-[690px] animate-pulse bg-slate-100 p-0" />
  </div>
);

const ChatbotWidgetTab = ({ chatbotSlug }) => {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useChatbotWidgetDetailsQuery({ chatbotSlug }, { skip: !chatbotSlug });

  if (!chatbotSlug || isLoading) return <WidgetLoadingState />;

  const details = getWidgetDetails(data);

  return (
    <WidgetConfiguration
      key={details?.id || "widget"}
      chatbotSlug={chatbotSlug}
      details={details}
      isFetching={isFetching}
      isError={isError}
      error={error}
      refetch={refetch}
    />
  );
};

export default ChatbotWidgetTab;
