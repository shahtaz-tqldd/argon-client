import ContentDialog from "@/components/dialog/content-dialog";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/card";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { FeatureToggle, Toggle } from "@/components/ui/toggle";
import { CalendarClock, Check, Pencil } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const BookingRules = () => {
  const [serviceEnabled, setServiceEnabled] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rules, setRules] = useState({
    duration: "30 minutes",
    buffer: "15 minutes",
    notice: "4 hours",
    window: "30 days",
    timezone: "Asia/Dhaka (UTC+6)",
    detectTimezone: true,
  });
  return (
    <>
      <SectionCard
        icon={CalendarClock}
        title="Booking rules"
        description="Timing, notice, buffers, and timezone."
        action={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setRulesOpen(true)}
          >
            <Pencil />
          </Button>
        }
      >
        <FeatureToggle
          enabled={serviceEnabled}
          setEnabled={setServiceEnabled}
          activeTitle="Booking is live"
          inActiveTitle="Booking is paused"
          activeText="Visitors can book available times through Atlas Support."
          inActiveText="The chatbot will not offer appointment slots."
        />
        <div className="divide-y">
          {[
            ["Default duration", rules.duration],
            ["Buffer", rules.buffer],
            ["Minimum notice", rules.notice],
            ["Book up to", rules.window],
            ["Timezone", rules.timezone],
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
      <RulesDialog
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        rules={rules}
        setRules={setRules}
      />
    </>
  );
};

function RulesDialog({ open, onClose, rules, setRules }) {
  const [draft, setDraft] = useState(rules);
  const save = () => {
    setRules(draft);
    toast.success("Booking rules saved");
    onClose();
  };
  return (
    <ContentDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title="Booking rules"
      description="Control duration, buffers, booking windows, and timezone."
      footer={
        <div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>
            <Check />
            Save rules
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
        <FloatingSelect
          label="Default duration"
          value={draft.duration}
          displayValue={draft.duration}
          onValueChange={(value) =>
            setDraft((current) => ({ ...current, duration: value }))
          }
        >
          {["15 minutes", "30 minutes", "45 minutes", "60 minutes"].map(
            (item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ),
          )}
        </FloatingSelect>
        <FloatingSelect
          label="Buffer between calls"
          value={draft.buffer}
          displayValue={draft.buffer}
          onValueChange={(value) =>
            setDraft((current) => ({ ...current, buffer: value }))
          }
        >
          {["No buffer", "10 minutes", "15 minutes", "30 minutes"].map(
            (item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ),
          )}
        </FloatingSelect>
        <FloatingSelect
          label="Minimum notice"
          value={draft.notice}
          displayValue={draft.notice}
          onValueChange={(value) =>
            setDraft((current) => ({ ...current, notice: value }))
          }
        >
          {["1 hour", "4 hours", "12 hours", "24 hours"].map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </FloatingSelect>
        <FloatingSelect
          label="Booking window"
          value={draft.window}
          displayValue={draft.window}
          onValueChange={(value) =>
            setDraft((current) => ({ ...current, window: value }))
          }
        >
          {["14 days", "30 days", "60 days", "90 days"].map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </FloatingSelect>
        <div className="sm:col-span-2">
          <FloatingSelect
            label="Schedule timezone"
            value={draft.timezone}
            displayValue={draft.timezone}
            onValueChange={(value) =>
              setDraft((current) => ({ ...current, timezone: value }))
            }
          >
            {[
              "Asia/Dhaka (UTC+6)",
              "America/Los_Angeles (UTC−7)",
              "America/New_York (UTC−4)",
              "Europe/London (UTC+1)",
            ].map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </FloatingSelect>
        </div>
        <div className="flex items-start justify-between gap-4 rounded-2xl border p-4 sm:col-span-2">
          <div>
            <p className="text-sm font-semibold">Visitor timezone detection</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Show available times in each visitor’s local timezone.
            </p>
          </div>
          <Toggle
            checked={draft.detectTimezone}
            onChange={(value) =>
              setDraft((current) => ({ ...current, detectTimezone: value }))
            }
          />
        </div>
      </div>
    </ContentDialog>
  );
}

export default BookingRules;
