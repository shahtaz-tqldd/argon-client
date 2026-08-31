import { UserRoundCheck } from "lucide-react";
import { toast } from "sonner";

import CollectableFieldsConfig from "@/components/shared/collectable-fields-config";
import { useUpdateLeadCaptureConfigMutation } from "@/features/lead_captures/leadCaptureApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

const MAX_LEAD_FIELDS = 10;

const FieldsConfig = ({ chatbotSlug, config }) => {
  const [updateConfig, { isLoading }] =
    useUpdateLeadCaptureConfigMutation();

  const saveFields = async (collectableFields) => {
    try {
      await updateConfig({
        chatbotSlug,
        payload: { collectable_fields: collectableFields },
      }).unwrap();
      toast.success("Lead collection fields updated");
      return true;
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update lead collection fields."),
      );
      return false;
    }
  };

  return (
    <CollectableFieldsConfig
      icon={UserRoundCheck}
      title="Information to collect"
      description="Fields requested when the chatbot captures a lead."
      dialogTitle="Lead information"
      dialogDescription="Choose what the chatbot should collect from prospective leads."
      fields={config?.collectable_fields}
      isEnabled={Boolean(config?.is_enabled)}
      isSaving={isLoading}
      maxFields={MAX_LEAD_FIELDS}
      onSave={saveFields}
    />
  );
};

export default FieldsConfig;
