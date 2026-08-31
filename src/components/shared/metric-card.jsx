import { cn } from "@/lib/utils";
import Card from "../ui/card";

const MetricCard = ({ icon, label, value, detail, tone, badge }) => {
  const MetricIcon = icon;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl",
            tone,
          )}
        >
          <MetricIcon className="size-4" />
        </span>
        {badge}
      </div>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 text-[11px] text-muted-foreground">{detail}</p>
    </Card>
  );
};

export { MetricCard };
