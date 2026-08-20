import { ArrowUpRight, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";

const LeadsCaptured = ({ leads }) => {
  if (!leads.isActive) {
    return (
      <Card className="flex h-full flex-col items-center justify-center p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UserPlus className="size-5" />
        </span>
        <h2 className="mt-3 font-bold text-foreground">Start capturing leads</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Collect contact details directly from chatbot conversations.
        </p>
        <Button size="sm" className="mt-4">Activate leads</Button>
      </Card>
    );
  }

  const maxTrendValue = Math.max(...leads.recentTrend);

  return (
    <Card className="relative h-full p-5 sm:p-6">
      <div className="absolute -right-8 -top-8 size-28 rounded-full bg-emerald-500/[0.07]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Leads captured</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {leads.total.toLocaleString()}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="size-3.5" /> {leads.thisMonth} this month
          </p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Users className="size-5" />
        </span>
      </div>

      <div className="mt-6 flex h-14 items-end gap-1.5" aria-hidden="true">
        {leads.recentTrend.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="flex-1 rounded-t-md bg-emerald-500/20 last:bg-emerald-500"
            style={{ height: `${Math.max(15, (value / maxTrendValue) * 100)}%` }}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 divide-x divide-border rounded-2xl bg-muted/40 p-3">
        <div className="px-2">
          <p className="text-lg font-bold text-foreground">{leads.qualified}</p>
          <p className="text-[11px] text-muted-foreground">Qualified leads</p>
        </div>
        <div className="px-4">
          <p className="text-lg font-bold text-foreground">{leads.conversionRate}%</p>
          <p className="text-[11px] text-muted-foreground">Conversion rate</p>
        </div>
      </div>
    </Card>
  );
};

export default LeadsCaptured;
