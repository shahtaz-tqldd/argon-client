import React, { useMemo, useState } from "react";
import {
  CalendarIcon,
  MessageSquareText,
  Sparkles,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Text, Title } from "@/components/ui/typography";
import Card from "@/components/ui/card";
import { useAiUsageQuery } from "@/features/analytics/analyticsApiSlice";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import moment from "moment";

const usageTypes = [
  { key: "chat", label: "Chat", color: "bg-emerald-500" },
  { key: "trip_planning", label: "Trip Planning", color: "bg-sky-500" },
  { key: "trip_chat", label: "Trip Chat", color: "bg-amber-500" },
];

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value || 0));

const formatCost = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })}`;

const formatDateParam = (date) => moment(date).format("YYYY-MM-DD");

const getRangeLabel = (range) => {
  if (!range?.from) return "Select date range";
  if (!range?.to) return moment(range.from).format("MMM D, YYYY");
  return `${moment(range.from).format("MMM D, YYYY")} - ${moment(range.to).format("MMM D, YYYY")}`;
};

const AIUsage = ({ className }) => {
  const [dateRange, setDateRange] = useState({});

  const queryParams = useMemo(
    () => ({
      startDate: dateRange?.from ? formatDateParam(dateRange.from) : undefined,
      endDate: dateRange?.to ? formatDateParam(dateRange.to) : undefined,
    }),
    [dateRange],
  );

  const { data, isFetching, isError } = useAiUsageQuery(queryParams);
  const usage = data?.data || {};
  const totalTokens = Number(usage.total_tokens || 0);
  const breakdown = usageTypes.map((item) => {
    const stats = usage[item.key] || {};
    const tokens = Number(stats.tokens || 0);
    return {
      ...item,
      cost: Number(stats.cost || 0),
      tokens,
      percent: totalTokens ? Math.round((tokens / totalTokens) * 100) : 0,
    };
  });

  return (
    <Card className={cn("min-w-0 w-full max-w-full", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Title variant="md">AI Usage</Title>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-11  justify-start rounded-xl border-slate-200 bg-white px-3 text-left font-medium shadow-none"
              aria-label="Filter AI usage by date range"
            >
              <CalendarIcon className="size-4 text-slate-500" />
              <span className="truncate">{getRangeLabel(dateRange)}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto rounded-2xl p-0">
            <Calendar
              mode="range"
              numberOfMonths={1}
              selected={dateRange}
              onSelect={setDateRange}
              disabled={{ after: new Date() }}
            />
            <div className="flex items-center justify-between gap-2 border-t px-3 py-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDateRange(undefined)}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  setDateRange({
                    from: moment().subtract(29, "days").toDate(),
                    to: new Date(),
                  })
                }
              >
                Last 30 days
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isFetching ? (
        <div className="mt-6 space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          </div>
          <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      ) : isError ? (
        <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-4 text-center text-sm font-semibold text-red-700">
          Unable to load AI usage data.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-primary/15 bg-primary/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Text variant="xs" className="font-semibold uppercase">
                  Total Cost
                </Text>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCost(usage.total_cost)}
                </div>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-primary">
                <Wallet className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <Text variant="sm" className="font-semibold text-slate-700">
                Usage Breakdown
              </Text>
              <Text variant="xs">{formatNumber(totalTokens)} tokens</Text>
            </div>

            <div className="mt-4 space-y-4">
              {breakdown.map((item) => (
                <div key={item.key}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.percent}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className={cn("h-full rounded-full", item.color)}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>{formatNumber(item.tokens)} tokens</span>
                    <span>{formatCost(item.cost)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const UsageStat = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
    <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
      {React.createElement(icon, { className: "size-4" })}
    </div>
    <Text variant="xs" className="font-semibold uppercase">
      {label}
    </Text>
    <div className="mt-1 text-xl font-bold text-slate-900">{value}</div>
  </div>
);

export default AIUsage;
