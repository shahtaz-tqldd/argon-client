import { UserRoundCheck } from "lucide-react";
import { toast } from "sonner";

import CollectableFieldsConfig from "@/components/shared/collectable-fields-config";
import { useUpdateAppointmentBookingConfigMutation } from "@/features/appointment-booking/appointmentBookingApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

const InfoCollect = ({ chatbotSlug, config }) => {
  const [updateConfig, { isLoading }] =
    useUpdateAppointmentBookingConfigMutation();

  const saveFields = async (collectableFields) => {
    try {
      await updateConfig({
        chatbotSlug,
        payload: { collectable_fields: collectableFields },
      }).unwrap();
      toast.success("Booking information fields updated");
      return true;
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update booking fields."),
      );
      return false;
    }
  };

  return (
    <CollectableFieldsConfig
      icon={UserRoundCheck}
      title="Information to collect"
      description="Fields requested before an appointment is confirmed."
      dialogTitle="Booking information"
      dialogDescription="Choose what the chatbot should collect before confirming an appointment."
      fields={config?.collectable_fields}
      isEnabled={Boolean(config?.is_enabled)}
      isSaving={isLoading}
      onSave={saveFields}
    />
  );
};

export default InfoCollect;
