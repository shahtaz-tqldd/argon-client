import { useMemo, memo } from "react";
import { ArrowUpRight, MessagesSquare, MessageSquare } from "lucide-react";

import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChatSessionStatsQuery } from "@/features/chat/chatApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";

const MiniBarChart = memo(({ values }) => {
  const maxValue = Math.max(...values, 1);

  return (
    <div className="flex h-12 w-28 items-end gap-1" aria-hidden="true">
      {values.map((value, index) => (
        <span
          key={index}
          className="min-h-1 flex-1 rounded-full bg-primary/20 transition-colors last:bg-primary"
          style={{ height: `${(value / maxValue) * 100}%` }}
        />
      ))}
    </div>
  );
});

MiniBarChart.displayName = "MiniBarChart";

const OverviewStats = ({ className }) => {
  const { chatbotSlug } = useCurrentChatbot();
  const { data } = useChatSessionStatsQuery(
    { chatbotSlug },
    { skip: !chatbotSlug },
  );

  const {
    total_sessions = 0,
    total_messages = 0,
    session_percentage_change = 0,
    message_percentage_change = 0,
  } = data?.data || {};

  const kpiStats = useMemo(
    () => [
      {
        label: "Total conversations",
        value: total_sessions,
        change: session_percentage_change,
        comparison: "vs. last month",
        icon: MessagesSquare,
        chart: [34, 45, 41, 58, 52, 67, 78, 72, 88, 96],
      },
      {
        label: "Total messages",
        value: total_messages,
        change: message_percentage_change,
        comparison: "vs. last month",
        icon: MessageSquare,
        chart: [28, 38, 36, 48, 57, 53, 70, 76, 82, 91],
      },
    ],
    [
      total_sessions,
      total_messages,
      session_percentage_change,
      message_percentage_change,
    ],
  );

  return (
    <Card
      aria-label="Chatbot overview statistics"
      className={cn("grid gap-12 md:grid-cols-2 relative", className)}
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[4rem] bg-primary/[0.035]" />

      {kpiStats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div key={stat.label}>
            <div className="relative flex items-end justify-between gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
                <p className="mt-5 text-3xl font-bold tracking-tight text-foreground">
                  {Number(stat.value).toLocaleString()}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="size-3.5" /> {stat.change}%
                  </span>
                  <span className="text-muted-foreground">
                    {stat.comparison}
                  </span>
                </div>
              </div>
              <MiniBarChart values={stat.chart} />
            </div>
          </div>
        );
      })}
    </Card>
  );
};

export default memo(OverviewStats);
