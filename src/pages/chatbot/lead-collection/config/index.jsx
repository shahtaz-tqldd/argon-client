import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/dialog/confirm-dialog";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  useLeadCaptureConfigureQuery,
  useUpdateLeadCaptureConfigMutation,
} from "@/features/lead_captures/leadCaptureApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import CollectionConfig from "./collection-config";
import {
  getChangedValues,
  getCollectionSettingsPayload,
  getLeadCaptureConfig,
  hasChangedValues,
  normalizeCollectionSettings,
} from "./config-utils";
import FieldsConfig from "./fields-config";
import HubspotConfig from "./hubspot";

const LeadCaptureConfigContent = ({ chatbotSlug, config }) => {
  const [updateLeadCaptureConfig, { isLoading: isUpdating }] =
    useUpdateLeadCaptureConfigMutation();
  const [draftSettings, setDraftSettings] = useState(() =>
    normalizeCollectionSettings(config),
  );
  const [savedSettings, setSavedSettings] = useState(() =>
    normalizeCollectionSettings(config),
  );
  const [isEnabled, setIsEnabled] = useState(() => Boolean(config.is_enabled));
  const [pendingEnabled, setPendingEnabled] = useState(null);

  const currentSettingsPayload = getCollectionSettingsPayload(draftSettings);
  const savedSettingsPayload = getCollectionSettingsPayload(savedSettings);
  const hasSettingsChanges = hasChangedValues(
    currentSettingsPayload,
    savedSettingsPayload,
  );

  const updateConfig = async (payload, fallbackMessage) => {
    try {
      const response = await updateLeadCaptureConfig({
        chatbotSlug,
        payload,
      }).unwrap();
      toast.success(response?.message || fallbackMessage);
      return true;
    } catch (updateError) {
      toast.error(
        getApiErrorMessage(
          updateError,
          "Unable to update the lead collection settings.",
        ),
      );
      return false;
    }
  };

  const saveCollectionSettings = async () => {
    if (
      draftSettings.require_consent &&
      !draftSettings.consent_message.trim()
    ) {
      toast.error("Add a consent message when consent is required.");
      return;
    }

    const payload = getChangedValues(
      currentSettingsPayload,
      savedSettingsPayload,
    );
    if (!Object.keys(payload).length) return;

    const updated = await updateConfig(
      payload,
      "Lead collection behavior updated.",
    );
    if (updated) setSavedSettings(draftSettings);
  };

  const confirmEnabledChange = async () => {
    const nextEnabled = pendingEnabled;
    const updated = await updateConfig(
      { is_enabled: nextEnabled },
      `Lead collection ${nextEnabled ? "enabled" : "disabled"}.`,
    );

    if (updated) {
      setIsEnabled(nextEnabled);
      setPendingEnabled(null);
    }
  };

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-5">
        <div className="space-y-5 xl:col-span-3">
          <CollectionConfig
            settings={draftSettings}
            setSettings={setDraftSettings}
            isEnabled={isEnabled}
            onEnabledChange={setPendingEnabled}
            hasChanges={hasSettingsChanges}
            isUpdating={isUpdating}
            onSave={saveCollectionSettings}
          />
        </div>

        <div className="space-y-5 xl:col-span-2">
          <FieldsConfig chatbotSlug={chatbotSlug} config={config} />
          <HubspotConfig />
        </div>
      </div>

      <ConfirmDialog
        open={pendingEnabled !== null}
        setOpen={(open) => {
          if (!open) setPendingEnabled(null);
        }}
        title={`${pendingEnabled ? "Enable" : "Disable"} lead collection?`}
        description={
          pendingEnabled
            ? "The chatbot will be able to request the visible fields from visitors during conversations."
            : "The chatbot will stop requesting lead information. Your field configuration will remain saved."
        }
        confirmText={
          pendingEnabled ? "Enable collection" : "Disable collection"
        }
        confirmVariant={pendingEnabled ? "default" : "destructive"}
        onConfirm={confirmEnabledChange}
        isLoading={isUpdating}
      />
    </>
  );
};

const LeadCaptureConfig = () => {
  const { chatbotSlug } = useCurrentChatbot();
  const {
    data: configResponse,
    isError,
    error,
    refetch,
  } = useLeadCaptureConfigureQuery({ chatbotSlug }, { skip: !chatbotSlug });
  const config = getLeadCaptureConfig(configResponse);

  if (!config) {
    return (
      <Card>
        {isError ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/[0.035] p-4">
            <div>
              <p className="text-sm font-semibold text-red-600">
                Unable to load lead collection settings
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {getApiErrorMessage(error, "Please try again later.")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw />
              Retry
            </Button>
          </div>
        ) : (
          <LeadFieldsSkeleton />
        )}
      </Card>
    );
  }

  return (
    <LeadCaptureConfigContent
      key={config.id || chatbotSlug}
      chatbotSlug={chatbotSlug}
      config={config}
    />
  );
};

const LeadFieldsSkeleton = () => (
  <div className="space-y-4" aria-label="Loading lead collection settings">
    <div className="h-20 animate-pulse rounded-2xl bg-muted" />
    <div className="space-y-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-14 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  </div>
);

export default LeadCaptureConfig;
