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
import { toSnakeCase } from "@/lib/utils";

import CollectionConfig from "./collection-config";
import {
  getChangedValues,
  getCollectionSettingsPayload,
  getFieldsPayload,
  getLeadCaptureConfig,
  hasChangedValues,
  normalizeCollectionSettings,
  normalizeConfigFields,
  STANDARD_FIELD_VALUES,
} from "./config-utils";
import FieldsConfig from "./fields-config";
import HubspotConfig from "./hubspot";

const LeadCaptureConfigContent = ({ chatbotSlug, config, isFetching }) => {
  const [updateLeadCaptureConfig, { isLoading: isUpdating }] =
    useUpdateLeadCaptureConfigMutation();
  const [draftFields, setDraftFields] = useState(() =>
    normalizeConfigFields(config),
  );
  const [savedFields, setSavedFields] = useState(() =>
    normalizeConfigFields(config),
  );
  const [draftSettings, setDraftSettings] = useState(() =>
    normalizeCollectionSettings(config),
  );
  const [savedSettings, setSavedSettings] = useState(() =>
    normalizeCollectionSettings(config),
  );
  const [isEnabled, setIsEnabled] = useState(() =>
    Boolean(config.is_enabled),
  );
  const [pendingEnabled, setPendingEnabled] = useState(null);

  const currentFieldsPayload = getFieldsPayload(draftFields);
  const savedFieldsPayload = getFieldsPayload(savedFields);
  const currentSettingsPayload = getCollectionSettingsPayload(draftSettings);
  const savedSettingsPayload = getCollectionSettingsPayload(savedSettings);
  const hasFieldChanges = hasChangedValues(
    currentFieldsPayload,
    savedFieldsPayload,
  );
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

  const validateFields = () => {
    const customFields = draftFields.custom_fields;
    const fieldValues = customFields.map((field) =>
      toSnakeCase(field.label),
    );

    if (customFields.some((field) => !field.label.trim())) {
      toast.error("Add a label for every custom field.");
      return false;
    }

    if (fieldValues.some((fieldValue) => !fieldValue)) {
      toast.error("Custom field labels must contain letters or numbers.");
      return false;
    }

    if (
      new Set(fieldValues).size !== fieldValues.length ||
      fieldValues.some((fieldValue) => STANDARD_FIELD_VALUES.has(fieldValue))
    ) {
      toast.error("Use a unique label for every custom field.");
      return false;
    }

    return true;
  };

  const saveFields = async () => {
    if (!validateFields()) return;

    const payload = getChangedValues(
      currentFieldsPayload,
      savedFieldsPayload,
    );
    if (!Object.keys(payload).length) return;

    const updated = await updateConfig(
      payload,
      "Lead collection fields updated.",
    );
    if (updated) setSavedFields(draftFields);
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
          <FieldsConfig
            fields={draftFields}
            setFields={setDraftFields}
            hasChanges={hasFieldChanges}
            isFetching={isFetching}
            isUpdating={isUpdating}
            onSave={saveFields}
          />
        </div>

        <div className="space-y-5 xl:col-span-2">
          <CollectionConfig
            settings={draftSettings}
            setSettings={setDraftSettings}
            isEnabled={isEnabled}
            onEnabledChange={setPendingEnabled}
            hasChanges={hasSettingsChanges}
            isUpdating={isUpdating}
            onSave={saveCollectionSettings}
          />
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
    isFetching,
    isError,
    error,
    refetch,
  } = useLeadCaptureConfigureQuery(
    { chatbotSlug },
    { skip: !chatbotSlug },
  );
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
      isFetching={isFetching}
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
