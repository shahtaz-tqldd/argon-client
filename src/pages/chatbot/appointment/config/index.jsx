import { useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BellRing,
  Building2,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CalendarX2,
  Check,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Facebook,
  Globe2,
  Instagram,
  Link2,
  Mail,
  MapPin,
  MessageCircleMore,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings2,
  Sparkles,
  UserRound,
  UserRoundCheck,
  Video,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import Card, { SectionCard } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput, Input } from "@/components/ui/input";
import {
  FloatingSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import WeeklySchedule from "./schedule";
import BookingRules from "./rules";

const AppointmentConfigTab = ({
  serviceEnabled,
  setServiceEnabled,
  fields,
  setFields,
}) => {
  const [fieldsOpen, setFieldsOpen] = useState(false);
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
  const [notifications, setNotifications] = useState({
    confirmation: true,
    host: true,
    reminder24: true,
    reminder1: false,
    cancellation: true,
    followUp: false,
  });
  const enabledFields = fields.filter((field) => field.enabled);
  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <SectionCard
        icon={CalendarCheck2}
        title="Booking service"
        description="Enable or pause appointment booking without losing your setup."
        action={
          <Toggle checked={serviceEnabled} onChange={setServiceEnabled} />
        }
      >
        <div
          className={cn(
            "flex items-center gap-4 rounded-2xl border p-4",
            serviceEnabled
              ? "border-emerald-500/15 bg-emerald-500/[0.05]"
              : "bg-muted/30",
          )}
        >
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              serviceEnabled
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-muted text-muted-foreground",
            )}
          >
            {serviceEnabled ? (
              <Check className="size-5" />
            ) : (
              <X className="size-5" />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold">
              {serviceEnabled ? "Booking is live" : "Booking is paused"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {serviceEnabled
                ? "Visitors can book available times through Atlas Support."
                : "The chatbot will not offer appointment slots."}
            </p>
          </div>
        </div>
      </SectionCard>
      <SectionCard
        icon={UserRoundCheck}
        title="Information to collect"
        description="Fields requested before an appointment is confirmed."
        action={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setFieldsOpen(true)}
          >
            <Pencil />
          </Button>
        }
      >
        <div className="flex flex-wrap gap-2">
          {enabledFields.map((field) => (
            <span
              key={field.id}
              className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
            >
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </span>
          ))}
        </div>
        <button
          onClick={() => setFieldsOpen(true)}
          className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary"
        >
          Configure fields <ChevronRight className="size-3.5" />
        </button>
      </SectionCard>
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
      <SectionCard
        icon={BellRing}
        title="Email notifications"
        description="Choose which booking emails Argon sends to guests and hosts."
      >
        <div className="divide-y">
          {[
            [
              "confirmation",
              "Guest confirmation",
              "Send date, time, timezone, and meeting link.",
            ],
            [
              "host",
              "Notify appointment host",
              "Email the assigned host when a booking is made.",
            ],
            [
              "reminder24",
              "24-hour reminder",
              "Remind the guest one day before the meeting.",
            ],
            [
              "reminder1",
              "1-hour reminder",
              "Send a final reminder shortly before the meeting.",
            ],
            [
              "cancellation",
              "Cancellation and reschedule",
              "Notify both guest and host about schedule changes.",
            ],
            [
              "followUp",
              "Post-meeting follow-up",
              "Send a follow-up email after completed meetings.",
            ],
          ].map(([key, label, help]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div>
                <p className="text-xs font-semibold">{label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {help}
                </p>
              </div>
              <Toggle
                checked={notifications[key]}
                onChange={(value) =>
                  setNotifications((current) => ({ ...current, [key]: value }))
                }
              />
            </div>
          ))}
        </div>
        <button className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
          Edit email templates <ChevronRight className="size-3.5" />
        </button>
      </SectionCard>
      <WeeklySchedule />
      <BookingRules />
      <BookingFieldsDialog
        open={fieldsOpen}
        onClose={() => setFieldsOpen(false)}
        fields={fields}
        setFields={setFields}
      />
      <GoogleCalendarDialog
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        integration={calendar}
        setIntegration={setCalendar}
      />
    </div>
  );
};

function BookingFieldsDialog({ open, onClose, fields, setFields }) {
  const [draft, setDraft] = useState(fields);
  const update = (id, key, value) =>
    setDraft((current) =>
      current.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    );
  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= draft.length) return;
    setDraft((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const save = () => {
    setFields(draft);
    toast.success("Booking form fields saved");
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-muted/30 px-6 py-6">
          <DialogTitle>Booking information</DialogTitle>
          <DialogDescription>
            Choose what the chatbot should collect before confirming an
            appointment.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Form fields</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag order is represented with the arrow controls.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setDraft((current) => [
                  ...current,
                  {
                    id: `custom-${Date.now()}`,
                    label: "Custom question",
                    type: "Text",
                    enabled: true,
                    required: false,
                  },
                ])
              }
            >
              <Plus />
              Add field
            </Button>
          </div>
          <div className="space-y-2">
            {draft.map((field, index) => (
              <div
                key={field.id}
                className={cn(
                  "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3",
                  !field.enabled && "opacity-55",
                )}
              >
                <div className="flex flex-col">
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="text-muted-foreground disabled:opacity-20"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === draft.length - 1}
                    className="text-muted-foreground disabled:opacity-20"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
                <div className="min-w-0">
                  <input
                    value={field.label}
                    onChange={(event) =>
                      update(field.id, "label", event.target.value)
                    }
                    className="w-full bg-transparent text-xs font-semibold outline-none"
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {field.type}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Checkbox
                      checked={field.required}
                      disabled={!field.enabled}
                      onCheckedChange={(value) =>
                        update(field.id, "required", value === true)
                      }
                    />
                    Required
                  </label>
                  <Toggle
                    checked={field.enabled}
                    disabled={field.locked}
                    onChange={(value) => update(field.id, "enabled", value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>
            <Check />
            Save fields
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GoogleCalendarDialog({ open, onClose, integration, setIntegration }) {
  const [draft, setDraft] = useState(integration);
  const save = () => {
    setIntegration({ ...draft, connected: true, lastSync: "Just now" });
    toast.success("Google Calendar connected");
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="rounded-3xl p-0 sm:max-w-xl">
        <DialogHeader className="border-b bg-muted/30 px-6 py-6">
          <span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
            G
          </span>
          <DialogTitle>
            {integration.connected
              ? "Manage Google Calendar"
              : "Connect Google Calendar"}
          </DialogTitle>
          <DialogDescription>
            Prevent double bookings and add confirmed appointments to your
            calendar.
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} className="bg-blue-600 hover:bg-blue-700">
            <Link2 />
            {integration.connected
              ? "Save connection"
              : "Connect Google Calendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AppointmentConfigTab;
