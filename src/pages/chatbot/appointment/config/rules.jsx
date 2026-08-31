import { useState } from "react";
import { CalendarClock, Check, Globe2, Pencil } from "lucide-react";
import { toast } from "sonner";

import ContentDialog from "@/components/dialog/content-dialog";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { FloatingTextarea } from "@/components/ui/textarea";
import { FeatureToggle } from "@/components/ui/toggle";
import { useUpdateAppointmentBookingConfigMutation } from "@/features/appointment-booking/appointmentBookingApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

const formatTimezone = (timezone) =>
  String(timezone || "UTC").replaceAll("_", " ");

const BookingRules = ({ chatbotSlug, config, currentChatbot }) => {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [updateConfig, { isLoading: isUpdatingStatus }] =
    useUpdateAppointmentBookingConfigMutation();
  const timezone = currentChatbot?.timezone || "UTC";
  const chatbotName =
    currentChatbot?.chatbot_name || currentChatbot?.name || "the chatbot";

  const changeEnabled = async (isEnabled) => {
    try {
      await updateConfig({
        chatbotSlug,
        payload: { is_enabled: isEnabled },
      }).unwrap();
      toast.success(
        isEnabled ? "Appointment booking enabled" : "Appointment booking paused",
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update appointment booking."),
      );
    }
  };

  return (
    <>
      <SectionCard
        icon={CalendarClock}
        title="Booking rules"
        description="Availability limits and booking behavior."
        action={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setRulesOpen(true)}
            aria-label="Edit booking rules"
          >
            <Pencil />
          </Button>
        }
      >
        <FeatureToggle
          enabled={Boolean(config?.is_enabled)}
          setEnabled={changeEnabled}
          disabled={isUpdatingStatus}
          activeTitle="Booking is live"
          inActiveTitle="Booking is paused"
          activeText={`Visitors can book available times through ${chatbotName}.`}
          inActiveText="The chatbot will not offer appointment slots."
        />

        <div className="mt-4 divide-y">
          {[
            [
              "Appointment duration",
              `${config.appointment_duration_minutes} minutes`,
            ],
            ["Booking window", `${config.maximum_advance_days} days ahead`],
            [
              "Daily limit",
              config.max_appointments_per_day
                ? `${config.max_appointments_per_day} appointments`
                : "No limit",
            ],
            ["Schedule timezone", formatTimezone(timezone)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-4 py-2.5 text-xs"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="text-right font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {rulesOpen && (
        <RulesDialog
          open
          onClose={() => setRulesOpen(false)}
          chatbotSlug={chatbotSlug}
          config={config}
          timezone={timezone}
        />
      )}
    </>
  );
};

function RulesDialog({ open, onClose, chatbotSlug, config, timezone }) {
  const [draft, setDraft] = useState({
    duration: String(config.appointment_duration_minutes),
    advanceDays: String(config.maximum_advance_days),
    dailyLimit:
      config.max_appointments_per_day === null
        ? ""
        : String(config.max_appointments_per_day),
    confirmationMessage: config.confirmation_message || "",
  });
  const [updateConfig, { isLoading }] =
    useUpdateAppointmentBookingConfigMutation();
  const durationOptions = [
    ...new Set([15, 30, 45, 60, Number(config.appointment_duration_minutes)]),
  ]
    .filter((value) => Number.isInteger(value) && value > 0)
    .sort((first, second) => first - second);

  const save = async () => {
    const duration = Number(draft.duration);
    const advanceDays = Number(draft.advanceDays);
    const dailyLimit = draft.dailyLimit.trim()
      ? Number(draft.dailyLimit)
      : null;

    if (!Number.isInteger(duration) || duration <= 0) {
      toast.error("Appointment duration must be a positive number of minutes.");
      return;
    }
    if (!Number.isInteger(advanceDays) || advanceDays <= 0) {
      toast.error("Booking window must be a positive number of days.");
      return;
    }
    if (
      dailyLimit !== null &&
      (!Number.isInteger(dailyLimit) || dailyLimit <= 0)
    ) {
      toast.error("Daily limit must be a positive whole number or left blank.");
      return;
    }

    try {
      await updateConfig({
        chatbotSlug,
        payload: {
          appointment_duration_minutes: duration,
          maximum_advance_days: advanceDays,
          max_appointments_per_day: dailyLimit,
          confirmation_message: draft.confirmationMessage.trim(),
        },
      }).unwrap();
      toast.success("Booking rules updated");
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update booking rules."),
      );
    }
  };

  return (
    <ContentDialog
      open={open}
      onOpenChange={(next) => !next && !isLoading && onClose()}
      title="Booking rules"
      description="Control appointment length, booking limits, and the confirmation experience."
      footer={
        <div className="flx gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isLoading}>
            {isLoading ? <span className="spinner spinner-white" /> : <Check />}
            Save rules
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
        <FloatingSelect
          label="Appointment duration"
          value={draft.duration}
          displayValue={`${draft.duration} minutes`}
          disabled={isLoading}
          onValueChange={(value) =>
            setDraft((current) => ({ ...current, duration: value }))
          }
        >
          {durationOptions.map((minutes) => (
            <SelectItem key={minutes} value={String(minutes)}>
              {minutes} minutes
            </SelectItem>
          ))}
        </FloatingSelect>

        <FloatingInput
          name="maximum-advance-days"
          label="Booking window (days)"
          type="number"
          min="1"
          step="1"
          value={draft.advanceDays}
          disabled={isLoading}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              advanceDays: event.target.value,
            }))
          }
        />

        <FloatingInput
          name="daily-appointment-limit"
          label="Daily appointment limit"
          type="number"
          min="1"
          step="1"
          placeholder="No limit"
          value={draft.dailyLimit}
          disabled={isLoading}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              dailyLimit: event.target.value,
            }))
          }
        />

        <div className="flex min-h-[54px] items-center gap-3 rounded-xl border bg-muted/20 px-4">
          <Globe2 className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Schedule timezone</p>
            <p className="truncate text-sm font-medium">{formatTimezone(timezone)}</p>
          </div>
        </div>

        <FloatingTextarea
          name="confirmation-message"
          label="Confirmation message"
          className="sm:col-span-2"
          textareaClassName="min-h-28"
          value={draft.confirmationMessage}
          disabled={isLoading}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              confirmationMessage: event.target.value,
            }))
          }
        />

        <div className="rounded-2xl border border-sky-500/15 bg-sky-500/[0.04] p-4 sm:col-span-2">
          <p className="text-xs font-semibold">Timezone is managed by the chatbot</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Weekly availability and appointment slots use {formatTimezone(timezone)}.
            Change it from the chatbot’s core details when your operating timezone changes.
          </p>
        </div>
      </div>
    </ContentDialog>
  );
}

export default BookingRules;
