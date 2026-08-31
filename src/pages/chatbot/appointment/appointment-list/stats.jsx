import React from "react";
import {
  CalendarCheck2,
  CalendarX2,
  Clock3,
  UserRoundCheck,
} from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";

const AppointmentStats = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={CalendarCheck2}
        label="Upcoming"
        value="18"
        detail="Across the next 7 days"
        tone="bg-primary/10 text-primary"
        badge={
          <span className="text-xs font-semibold text-emerald-600">
            +4 this week
          </span>
        }
      />
      <MetricCard
        icon={Clock3}
        label="Today"
        value="4"
        detail="Next at 2:30 PM"
        tone="bg-amber-500/10 text-amber-600"
        badge={<span className="size-2 rounded-full bg-amber-500" />}
      />
      <MetricCard
        icon={UserRoundCheck}
        label="Completed"
        value="42"
        detail="93% attendance rate"
        tone="bg-emerald-500/10 text-emerald-600"
        badge={
          <span className="text-xs font-semibold text-emerald-600">+12%</span>
        }
      />
      <MetricCard
        icon={CalendarX2}
        label="Cancelled"
        value="3"
        detail="6.2% cancellation rate"
        tone="bg-red-500/10 text-red-600"
        badge={
          <span className="text-xs font-semibold text-muted-foreground">
            This month
          </span>
        }
      />
    </div>
  );
};

export default AppointmentStats;
