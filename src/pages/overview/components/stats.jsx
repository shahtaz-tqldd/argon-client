import React from "react";

import { Text, Title } from "@/components/ui/typography";
import {
  MapPinned,
  Minus,
  TrendingDown,
  UsersRound,
  TrendingUp,
  Newspaper,
  MessageSquareDot,
} from "lucide-react";
import Card from "@/components/ui/card";
import { useOverviewQuery } from "@/features/analytics/analyticsApiSlice";

const formatChange = (value) => {
  const numeric = Number(value ?? 0);
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(numeric)}%`;
};

const formatNumber = (value) => new Intl.NumberFormat().format(value ?? 0);

const metricToCard = ({
  key,
  title,
  description,
  icon,
  metric,
  value,
  highlight,
}) => ({
  key,
  title,
  value: formatNumber(value),
  highlight,
  description,
  change: formatChange(metric?.growth_percentage_30_days),
  growth: Number(metric?.growth_percentage_30_days ?? 0),
  icon,
});

const OverviewStats = () => {
  const { data, isLoading, isError } = useOverviewQuery();
  const stats = data?.data;
  const overviewStats = stats
    ? [
        metricToCard({
          key: "users",
          title: "Total Users",
          value: stats.users?.total,
          highlight: `${formatNumber(stats.users?.this_month)} joined this month`,
          description: "Travelers who created an account",
          icon: UsersRound,
          metric: stats.users,
        }),
        metricToCard({
          key: "trips",
          title: "Trips Planned",
          value: stats.trips?.total_planned,
          highlight: `${formatNumber(stats.trips?.completed)} completed`,
          description: "AI-generated and saved travel plans",
          icon: MapPinned,
          metric: stats.trips,
        }),
        metricToCard({
          key: "journals",
          title: "Journals",
          value: stats.journals?.total,
          highlight: `${formatNumber(stats.journals?.this_month)} added this month`,
          description: "Travel journals created by users",
          icon: Newspaper,
          metric: stats.journals,
        }),
        metricToCard({
          key: "ai_messages",
          title: "AI Messages",
          value: stats.ai_messages?.total,
          highlight: `${formatNumber(stats.ai_messages?.this_month)} messages this month`,
          description: "Messages handled by the travel agent",
          icon: MessageSquareDot,
          metric: stats.ai_messages,
        }),
      ]
    : [];

  if (isLoading) {
    return (
      <section className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-[190px] animate-pulse bg-slate-50" />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <Card className="mt-6 border-red-100 bg-red-50 text-sm font-medium text-red-700">
        Unable to load overview stats.
      </Card>
    );
  }

  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((item) => {
          const Icon = item.icon;
          const TrendIcon =
            item.growth > 0
              ? TrendingUp
              : item.growth < 0
                ? TrendingDown
                : Minus;
          const trendClasses =
            item.growth > 0
              ? "bg-emerald-50 text-emerald-700"
              : item.growth < 0
                ? "bg-red-50 text-red-700"
                : "bg-slate-100 text-slate-600";

          return (
            <Card key={item.key}>
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <Text variant="sm" className="text-gray-500">
                    {item.title}
                  </Text>

                  <Title variant="xl" className="mt-2 text-gray-950">
                    {item.value}
                  </Title>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
              </div>

              <div className="relative mt-5">
                <Text variant="sm" className="font-medium text-gray-700">
                  {item.highlight}
                </Text>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <Text variant="xs" className="text-gray-500">
                    {item.description}
                  </Text>
                  <div
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trendClasses}`}
                    title="Change over the last 30 days"
                  >
                    <TrendIcon size={14} />
                    {item.change}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default OverviewStats;
