import {
  Building2,
  CalendarClock,
  CalendarDays,
  Clock3,
  ExternalLink,
  Globe2,
  Mail,
  Phone,
  Sparkles,
  UserRound,
  UserRoundCheck,
  Video,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { getInitials } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { DetailRow } from "@/components/shared/utils";
import ContentDialog from "@/components/dialog/content-dialog";

const DetailsDialog = ({ appointment, onClose, onStatusChange }) => {
  if (!appointment) return null;
  return (
    <ContentDialog
      open
      onOpenChange={(open) => !open && onClose()}
      header={
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
      }
    >
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
              <DetailRow key={label} icon={icon} label={label} value={value} />
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
    </ContentDialog>
  );
};

export default DetailsDialog;
