import { useMemo, useState } from "react";
import { CalendarRange, Pencil, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/card";
import { useAppointmentBookingSchedulesQuery } from "@/features/appointment/appointmentApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";

import AvailabilityDialog from "./schedule-dialog";
import { createSlotKey } from "./schedule-utils";
import { WEEKDAYS } from "@/constants/weekdays";

const normalizeTime = (value) => String(value || "").slice(0, 5);

const formatTime = (value) => {
  const [hours, minutes] = normalizeTime(value).split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return "—";

  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${
    hours >= 12 ? "PM" : "AM"
  }`;
};

const normalizeSchedules = (schedules) => {
  const schedulesByWeekday = new Map(
    (Array.isArray(schedules) ? schedules : []).map((schedule) => [
      schedule.weekday,
      schedule,
    ]),
  );

  return WEEKDAYS.map((day, weekday) => {
    const schedule = schedulesByWeekday.get(weekday);

    return {
      id: schedule?.id || null,
      weekday,
      day,
      isActive: Boolean(schedule?.is_active),
      slots: (Array.isArray(schedule?.slots) ? schedule.slots : [])
        .map((slot) => ({
          _key: slot.id || createSlotKey(),
          startTime: normalizeTime(slot.start_time),
          endTime: normalizeTime(slot.end_time),
          isActive: Boolean(slot.is_active),
        }))
        .sort((first, second) =>
          first.startTime.localeCompare(second.startTime),
        ),
    };
  });
};

const WeeklySchedule = ({ chatbotSlug, timezone = "UTC" }) => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const { data, isLoading, isFetching, isError, error, refetch } =
    useAppointmentBookingSchedulesQuery(
      { chatbotSlug },
      { skip: !chatbotSlug },
    );
  const schedules = useMemo(
    () => normalizeSchedules(data?.data?.schedules),
    [data?.data?.schedules],
  );
  const timezoneLabel = String(timezone || "UTC").replaceAll("_", " ");

  return (
    <>
      <SectionCard
        icon={CalendarRange}
        title="Weekly schedule"
        description={`Recurring availability in ${timezoneLabel}.`}
        action={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setScheduleOpen(true)}
            disabled={isLoading || isError}
            aria-label="Edit weekly availability"
          >
            <Pencil />
          </Button>
        }
      >
        {isLoading ? (
          <div className="space-y-3" aria-label="Loading weekly schedule">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="h-10 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.035] p-4">
            <p className="text-xs font-semibold text-red-600">
              Unable to load weekly availability
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {getApiErrorMessage(error, "Please try again in a moment.")}
            </p>
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={refetch}
            >
              <RefreshCw /> Retry
            </Button>
          </div>
        ) : (
          <div className={cn("divide-y", isFetching && "opacity-60")}>
            {schedules.map((schedule) => {
              const activeSlots = schedule.isActive
                ? schedule.slots.filter((slot) => slot.isActive)
                : [];

              return (
                <div
                  key={schedule.weekday}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "mt-1 size-2 shrink-0 rounded-full",
                        activeSlots.length
                          ? "bg-emerald-500"
                          : "bg-muted-foreground/30",
                      )}
                    />
                    <span className="w-20 text-xs font-semibold">
                      {schedule.day}
                    </span>
                  </div>
                  {activeSlots.length ? (
                    <div className="flex flex-wrap justify-end gap-1.5 text-xs">
                      {activeSlots.map((slot) => (
                        <span
                          key={slot._key}
                          className="rounded-lg bg-muted px-2.5 py-1.5 font-medium"
                        >
                          {formatTime(slot.startTime)}–
                          {formatTime(slot.endTime)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Unavailable
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {scheduleOpen && (
        <AvailabilityDialog
          open
          onClose={() => setScheduleOpen(false)}
          chatbotSlug={chatbotSlug}
          schedules={schedules}
          timezone={timezoneLabel}
        />
      )}
    </>
  );
};

export default WeeklySchedule;
