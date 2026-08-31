import React, { useState } from "react";
import { SectionCard } from "../../configuration/components/shared";
import { CalendarRange, Check, Pencil, Plus } from "lucide-react";
import { initialSchedule } from "../demo-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ContentDialog from "@/components/dialog/content-dialog";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";

const WeeklySchedule = () => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedule, setSchedule] = useState(initialSchedule);

  return (
    <>
      <SectionCard
        icon={CalendarRange}
        title="Weekly schedule"
        description="The recurring hours visitors can choose from."
        action={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setScheduleOpen(true)}
          >
            <Pencil />
          </Button>
        }
      >
        <div className="divide-y">
          {schedule.map((day) => (
            <div
              key={day.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    day.enabled ? "bg-emerald-500" : "bg-muted-foreground/30",
                  )}
                />
                <span className="w-20 text-xs font-semibold">{day.day}</span>
              </div>
              {day.enabled ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-lg bg-muted px-2.5 py-1.5 font-medium">
                    {day.start}
                  </span>
                  <span className="text-muted-foreground">–</span>
                  <span className="rounded-lg bg-muted px-2.5 py-1.5 font-medium">
                    {day.end}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Unavailable
                </span>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
      <AvailabilityDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        schedule={schedule}
        setSchedule={setSchedule}
      />
    </>
  );
};

function AvailabilityDialog({ open, onClose, schedule, setSchedule }) {
  const [draft, setDraft] = useState(schedule);
  const save = () => {
    setSchedule(draft);
    toast.success("Weekly availability updated");
    onClose();
  };
  return (
    <ContentDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title="Edit weekly availability"
      description="Choose the days and hours when visitors can book through the chatbot."
      footer={
        <div className="border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>
            <Check />
            Save availability
          </Button>
        </div>
      }
    >
      <div className="space-y-2 px-6 py-6">
        {draft.map((day) => (
          <div
            key={day.id}
            className={cn(
              "grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3",
              !day.enabled && "opacity-55",
            )}
          >
            <div className="flex items-center gap-2">
              <Toggle
                checked={day.enabled}
                onChange={(value) =>
                  setDraft((current) =>
                    current.map((item) =>
                      item.id === day.id ? { ...item, enabled: value } : item,
                    ),
                  )
                }
              />
              <span className="text-xs font-semibold">{day.day}</span>
            </div>
            {day.enabled ? (
              <div className="flex items-center gap-2">
                <Input
                  value={day.start}
                  onChange={(event) =>
                    setDraft((current) =>
                      current.map((item) =>
                        item.id === day.id
                          ? { ...item, start: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className="h-9 rounded-xl text-center text-xs"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  value={day.end}
                  onChange={(event) =>
                    setDraft((current) =>
                      current.map((item) =>
                        item.id === day.id
                          ? { ...item, end: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className="h-9 rounded-xl text-center text-xs"
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Unavailable</p>
            )}
            <button className="text-muted-foreground hover:text-primary">
              <Plus className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ContentDialog>
  );
}

export default WeeklySchedule;
