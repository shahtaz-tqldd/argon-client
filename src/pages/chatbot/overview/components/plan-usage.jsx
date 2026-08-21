import { Bot, Brain, Crown, HardDrive, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const usageStyles = {
  primary: {
    icon: Sparkles,
    iconClass: "bg-primary/10 text-primary",
    barClass: "bg-primary",
  },
  violet: {
    icon: Brain,
    iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    barClass: "bg-violet-500",
  },
  cyan: {
    icon: HardDrive,
    iconClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    barClass: "bg-cyan-500",
  },
};

const UsageMeter = ({ item }) => {
  const percentage = Math.round((item.current / item.limit) * 100);
  const style = usageStyles[item.tone];
  const Icon = style.icon;

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-xl",
              style.iconClass,
            )}
          >
            <Icon className="size-4" />
          </span>
          <span className="text-sm font-medium text-foreground">
            {item.label}
          </span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {item.display}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${item.label} usage`}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={percentage}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-all", style.barClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1.5 text-right text-[11px] text-muted-foreground">
        {percentage}% used
      </p>
    </div>
  );
};

const PlanUsage = ({ plan }) => (
  <section aria-labelledby="plan-usage-title" className="bg-primary/[0.025]">
    <div className="flex flex-col gap-4 border-b border-primary/15 bg-gradient-to-r from-primary/[0.1] via-primary/[0.04] to-transparent p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
          <Crown className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Current plan
          </p>
          <div className="mt-0.5">
            <h2 id="plan-usage-title" className="text-lg font-bold text-foreground">{plan.name}</h2>
            <p className="text-xs text-muted-foreground">{plan.renewalDate}</p>
          </div>
        </div>
      </div>
      <Button size="sm">Upgrade plan</Button>
    </div>

    <div className="space-y-5 p-5 sm:p-6">
      {plan.usage.map((item) => (
        <UsageMeter key={item.label} item={item} />
      ))}
    </div>
  </section>
);

export default PlanUsage;
