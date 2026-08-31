import { useMemo, useState } from "react";
import {
  CalendarRange,
  Check,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import ContentDialog from "@/components/dialog/content-dialog";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import {
  useAppointmentBookingSchedulesQuery,
  useUpdateAppointmentBookingSchedulesMutation,
} from "@/features/appointment-booking/appointmentBookingApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const normalizeTime = (value) => String(value || "").slice(0, 5);

const formatTime = (value) => {
  const [hours, minutes] = normalizeTime(value).split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return "—";

  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${
    hours >= 12 ? "PM" : "AM"
  }`;
};

const createSlotKey = () =>
  globalThis.crypto?.randomUUID?.() ||
  `slot-${Date.now()}-${Math.random().toString(36).slice(2)}`;

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
        .sort((first, second) => first.startTime.localeCompare(second.startTime)),
    };
  });
};

const timeToMinutes = (value) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60,
  ).padStart(2, "0")}`;

const findAvailableSlot = (slots) => {
  const ranges = slots
    .filter((slot) => slot.startTime && slot.endTime)
    .map((slot) => [timeToMinutes(slot.startTime), timeToMinutes(slot.endTime)]);
  const starts = [
    ...Array.from({ length: 28 }, (_, index) => 9 * 60 + index * 30),
    ...Array.from({ length: 18 }, (_, index) => index * 30),
  ];

  const start = starts.find((candidate) => {
    const end = candidate + 60;
    return (
      end <= 24 * 60 &&
      ranges.every(
        ([rangeStart, rangeEnd]) =>
          end <= rangeStart || candidate >= rangeEnd,
      )
    );
  });

  if (start === undefined) return null;

  return {
    _key: createSlotKey(),
    startTime: minutesToTime(start),
    endTime: minutesToTime(start + 60),
    isActive: true,
  };
};

const WeeklySchedule = ({ chatbotSlug, timezone = "UTC" }) => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAppointmentBookingSchedulesQuery(
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
              <div key={day} className="h-10 animate-pulse rounded-xl bg-muted" />
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
            <Button className="mt-3" size="sm" variant="outline" onClick={refetch}>
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
                          {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Unavailable</span>
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

function AvailabilityDialog({
  open,
  onClose,
  chatbotSlug,
  schedules,
  timezone,
}) {
  const [draft, setDraft] = useState(schedules);
  const [updateSchedules, { isLoading }] =
    useUpdateAppointmentBookingSchedulesMutation();

  const updateDay = (weekday, update) => {
    setDraft((current) =>
      current.map((schedule) =>
        schedule.weekday === weekday
          ? typeof update === "function"
            ? update(schedule)
            : { ...schedule, ...update }
          : schedule,
      ),
    );
  };

  const changeDayStatus = (schedule, isActive) => {
    updateDay(schedule.weekday, (current) => {
      if (!isActive || current.slots.length) {
        return { ...current, isActive };
      }

      return {
        ...current,
        isActive,
        slots: [findAvailableSlot([])],
      };
    });
  };

  const addSlot = (schedule) => {
    const slot = findAvailableSlot(schedule.slots);
    if (!slot) {
      toast.error(`No free one-hour window remains on ${schedule.day}.`);
      return;
    }

    updateDay(schedule.weekday, (current) => ({
      ...current,
      isActive: true,
      slots: [...current.slots, slot],
    }));
  };

  const updateSlot = (weekday, slotKey, changes) => {
    updateDay(weekday, (schedule) => ({
      ...schedule,
      slots: schedule.slots.map((slot) =>
        slot._key === slotKey ? { ...slot, ...changes } : slot,
      ),
    }));
  };

  const removeSlot = (weekday, slotKey) => {
    updateDay(weekday, (schedule) => {
      const slots = schedule.slots.filter((slot) => slot._key !== slotKey);
      return { ...schedule, slots, isActive: slots.length ? schedule.isActive : false };
    });
  };

  const save = async () => {
    for (const schedule of draft) {
      if (
        schedule.isActive &&
        !schedule.slots.some((slot) => slot.isActive)
      ) {
        toast.error(`${schedule.day} needs at least one active time slot.`);
        return;
      }

      const seenWindows = new Set();
      const activeRanges = [];
      for (const slot of schedule.slots) {
        if (!slot.startTime || !slot.endTime || slot.endTime <= slot.startTime) {
          toast.error(`${schedule.day} has an invalid time range.`);
          return;
        }

        const window = `${slot.startTime}-${slot.endTime}`;
        if (seenWindows.has(window)) {
          toast.error(`${schedule.day} has duplicate time ranges.`);
          return;
        }
        seenWindows.add(window);

        if (slot.isActive) {
          activeRanges.push([
            timeToMinutes(slot.startTime),
            timeToMinutes(slot.endTime),
          ]);
        }
      }

      activeRanges.sort((first, second) => first[0] - second[0]);
      if (
        activeRanges.some(
          (range, index) => index > 0 && range[0] < activeRanges[index - 1][1],
        )
      ) {
        toast.error(`${schedule.day} has overlapping active time slots.`);
        return;
      }
    }

    const payload = {
      schedules: draft.map((schedule) => ({
        weekday: schedule.weekday,
        is_active: schedule.isActive,
        slots: schedule.slots.map((slot) => ({
          start_time: `${slot.startTime}:00`,
          end_time: `${slot.endTime}:00`,
          is_active: slot.isActive,
        })),
      })),
    };

    try {
      await updateSchedules({ chatbotSlug, payload }).unwrap();
      toast.success("Weekly availability updated");
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update weekly availability."),
      );
    }
  };

  return (
    <ContentDialog
      open={open}
      onOpenChange={(next) => !next && !isLoading && onClose()}
      title="Edit weekly availability"
      description={`Choose the recurring hours visitors can book in ${timezone}.`}
      desktopClassName="sm:max-w-3xl"
      footer={
        <div className="flx gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isLoading}>
            {isLoading ? <span className="spinner spinner-white" /> : <Check />}
            Save availability
          </Button>
        </div>
      }
    >
      <div className="space-y-3 px-4 py-5 sm:px-6">
        {draft.map((schedule) => (
          <section
            key={schedule.weekday}
            className={cn(
              "rounded-2xl border p-4",
              !schedule.isActive && "bg-muted/20",
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Toggle
                  checked={schedule.isActive}
                  disabled={isLoading}
                  label={`${schedule.day} availability`}
                  onChange={(value) => changeDayStatus(schedule, value)}
                />
                <div>
                  <p className="text-sm font-semibold">{schedule.day}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {schedule.isActive ? "Accepting bookings" : "Unavailable"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading || !schedule.isActive}
                onClick={() => addSlot(schedule)}
              >
                <Plus /> Add time
              </Button>
            </div>

            {schedule.isActive && (
              <div className="mt-4 space-y-2">
                {schedule.slots.map((slot) => (
                  <div
                    key={slot._key}
                    className={cn(
                      "grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-muted/35 p-2",
                      !slot.isActive && "opacity-55",
                    )}
                  >
                    <Toggle
                      checked={slot.isActive}
                      disabled={isLoading}
                      label={`${schedule.day} time slot`}
                      onChange={(value) =>
                        updateSlot(schedule.weekday, slot._key, {
                          isActive: value,
                        })
                      }
                    />
                    <Input
                      type="time"
                      value={slot.startTime}
                      disabled={isLoading}
                      onChange={(event) =>
                        updateSlot(schedule.weekday, slot._key, {
                          startTime: event.target.value,
                        })
                      }
                      className="rounded-xl text-center text-xs"
                      aria-label={`${schedule.day} start time`}
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      disabled={isLoading}
                      onChange={(event) =>
                        updateSlot(schedule.weekday, slot._key, {
                          endTime: event.target.value,
                        })
                      }
                      className="rounded-xl text-center text-xs"
                      aria-label={`${schedule.day} end time`}
                    />
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={isLoading}
                      onClick={() => removeSlot(schedule.weekday, slot._key)}
                      aria-label={`Delete ${schedule.day} time slot`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </ContentDialog>
  );
}

export default WeeklySchedule;
