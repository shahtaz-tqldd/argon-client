import { useState } from "react";
import {
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

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FloatingSelect, SelectItem } from "@/components/ui/select";
import TabMenu from "@/components/ui/tab";

import { getInitials } from "@/lib/utils";

import { initialAppointments, initialBookingFields } from "./demo-data";
import Container from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section";
import AppointmentConfigTab from "./config";
import { StatusBadge } from "@/components/ui/badge";
import AppointmentListTab from "./appointment-list";
import { DetailRow } from "@/components/shared/utils";

const pageTabs = [
  {
    value: "appointments",
    label: "Appointments",
    icon: CalendarDays,
    count: 6,
  },
  { value: "settings", label: "Settings", icon: Settings2 },
];

function AppointmentDialog({ appointment, onClose, onStatusChange }) {
  if (!appointment) return null;
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-muted/30 px-6 py-6">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {getInitials(appointment.name)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>{appointment.title}</DialogTitle>
                <StatusBadge>{appointment.status}</StatusBadge>
              </div>
              <DialogDescription className="mt-1">
                Booked by {appointment.name} · {appointment.company}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid md:grid-cols-[0.9fr_1.25fr]">
          <section className="border-b p-6 md:border-b-0 md:border-r">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Guest details
            </p>
            <div className="mt-4 space-y-4">
              {[
                [UserRound, "Name", appointment.name],
                [Mail, "Email", appointment.email],
                [Phone, "Phone", appointment.phone],
                [Building2, "Company", appointment.company],
              ].map(([icon, label, value]) => (
                <DetailRow
                  key={label}
                  icon={icon}
                  label={label}
                  value={value}
                />
              ))}
            </div>
            <div className="mt-6">
              <FloatingSelect
                label="Appointment status"
                value={appointment.status}
                displayValue={appointment.status}
                onValueChange={(value) => onStatusChange(appointment.id, value)}
              >
                {["Pending", "Confirmed", "Completed", "Cancelled"].map(
                  (item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ),
                )}
              </FloatingSelect>
            </div>
          </section>
          <div>
            <section className="border-b p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Schedule
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  [CalendarDays, "Date", appointment.date],
                  [
                    Clock3,
                    "Time",
                    `${appointment.time} · ${appointment.timezone}`,
                  ],
                  [CalendarClock, "Duration", appointment.duration],
                  [UserRoundCheck, "Host", appointment.host],
                  [Video, "Location", appointment.location],
                  [Globe2, "Source", appointment.source],
                ].map(([icon, label, value]) => (
                  <DetailRow
                    key={label}
                    icon={icon}
                    label={label}
                    value={value}
                  />
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-5">
                <ExternalLink />
                Open calendar event
              </Button>
            </section>
            <section className="border-b p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Booking context
                </p>
              </div>
              <p className="mt-3 text-sm leading-6">{appointment.notes}</p>
            </section>
            <section className="flex flex-wrap gap-2 p-6">
              <Button size="sm">
                <CalendarClock />
                Reschedule
              </Button>
              <Button size="sm" variant="outline">
                <Mail />
                Email guest
              </Button>
              {appointment.status !== "Cancelled" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => onStatusChange(appointment.id, "Cancelled")}
                >
                  <X />
                  Cancel appointment
                </Button>
              )}
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const AppointmentBookingPage = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [appointments, setAppointments] = useState(initialAppointments);
  const [fields, setFields] = useState(initialBookingFields);
  const [serviceEnabled, setServiceEnabled] = useState(true);
  const [selected, setSelected] = useState(null);
  const updateStatus = (id, status) => {
    setAppointments((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setSelected((current) =>
      current?.id === id ? { ...current, status } : current,
    );
    toast.success(`Appointment marked ${status.toLowerCase()}`);
  };
  const toggleService = (value) => {
    setServiceEnabled(value);
    toast.success(
      value ? "Appointment booking enabled" : "Appointment booking paused",
    );
  };
  return (
    <Container>
      <SectionTitle
        icon={CalendarDays}
        title="Appointment booking"
        details="Manage and Configure appointment booking through the chatbot"
        lg
      />

      <TabMenu
        tabs={pageTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollable
        className="w-fit"
      />
      {activeTab === "appointments" && (
        <AppointmentListTab
          appointments={appointments}
          setAppointments={setAppointments}
          openAppointment={setSelected}
        />
      )}
      {activeTab === "settings" && (
        <AppointmentConfigTab
          serviceEnabled={serviceEnabled}
          setServiceEnabled={toggleService}
          fields={fields}
          setFields={setFields}
        />
      )}
      <AppointmentDialog
        appointment={selected}
        onClose={() => setSelected(null)}
        onStatusChange={updateStatus}
      />
    </Container>
  );
};

export default AppointmentBookingPage;
