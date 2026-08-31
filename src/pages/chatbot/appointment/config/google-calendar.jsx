import { useState } from "react";
import { CalendarDays, Link2 } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import ContentDialog from "@/components/dialog/content-dialog";

const GoogleCalendar = () => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendar, setCalendar] = useState({
    connected: false,
    account: "shahtaz@atlas.co",
    calendar: "Primary calendar",
    checkConflicts: true,
    createEvents: true,
    meetLink: true,
    lastSync: "Never",
  });
  return (
    <>
      <SectionCard
        icon={CalendarDays}
        title="Google Calendar"
        description="Sync bookings, prevent conflicts, and add Meet links."
        action={
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold",
              calendar.connected
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-muted text-muted-foreground",
            )}
          >
            {calendar.connected ? "Connected" : "Not connected"}
          </span>
        }
      >
        <div className="flex items-center gap-4 rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] p-4">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
            G
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {calendar.connected
                ? calendar.account
                : "Connect Google Calendar"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {calendar.connected
                ? `Primary sync · ${calendar.lastSync}`
                : "Availability, events, and Meet links"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setCalendarOpen(true)}
          variant={calendar.connected ? "outline" : "default"}
          className={cn(
            "mt-4 w-full",
            !calendar.connected && "bg-blue-600 hover:bg-blue-700",
          )}
        >
          <Link2 />
          {calendar.connected ? "Manage connection" : "Connect Google Calendar"}
        </Button>
      </SectionCard>
      <GoogleCalendarDialog
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        integration={calendar}
        setIntegration={setCalendar}
      />
    </>
  );
};

function GoogleCalendarDialog({ open, onClose, integration, setIntegration }) {
  const [draft, setDraft] = useState(integration);
  const save = () => {
    setIntegration({ ...draft, connected: true, lastSync: "Just now" });
    toast.success("Google Calendar connected");
    onClose();
  };
  return (
    <ContentDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={
        integration.connected
          ? "Manage Google Calendar"
          : "Connect Google Calendar"
      }
      description="Prevent double bookings and add confirmed appointments to your
            calendar."
      footer={
        <div className="flx gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} className="bg-blue-600 hover:bg-blue-700">
            <Link2 />
            {integration.connected
              ? "Save connection"
              : "Connect Google Calendar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 px-6 py-6">
        <FloatingInput
          name="google-account"
          label="Google account"
          value={draft.account}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              account: event.target.value,
            }))
          }
        />
        <FloatingSelect
          label="Calendar"
          value={draft.calendar}
          displayValue={draft.calendar}
          onValueChange={(value) =>
            setDraft((current) => ({ ...current, calendar: value }))
          }
        >
          {[
            "Primary calendar",
            "Sales calls",
            "Product demos",
            "Customer onboarding",
          ].map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </FloatingSelect>
        {[
          [
            "checkConflicts",
            "Check calendar conflicts",
            "Hide slots that overlap with existing Google events.",
          ],
          [
            "createEvents",
            "Create calendar events",
            "Add confirmed bookings with guest details.",
          ],
          [
            "meetLink",
            "Add Google Meet link",
            "Automatically create video conferencing links.",
          ],
        ].map(([key, label, help]) => (
          <div
            key={key}
            className="flex items-start justify-between gap-5 rounded-2xl border p-4"
          >
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{help}</p>
            </div>
            <Toggle
              checked={draft[key]}
              onChange={(value) =>
                setDraft((current) => ({ ...current, [key]: value }))
              }
            />
          </div>
        ))}
      </div>
    </ContentDialog>
  );
}

export default GoogleCalendar;
