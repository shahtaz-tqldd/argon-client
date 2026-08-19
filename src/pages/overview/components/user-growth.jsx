import Card from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text, Title } from "@/components/ui/typography";
import { useUserGrowthQuery } from "@/features/analytics/analyticsApiSlice";
import { cn } from "@/lib/utils";
import moment from "moment";

import React, { useEffect, useState } from "react";

const formatGrowthLabel = (value, granularity, label) => {
  if (label) return label;
  if (!value) return "";
  if (granularity === "day") return moment(value).format("MMM D");
  return moment(value).format("MMM YYYY");
};

const formatNumber = (value) => new Intl.NumberFormat().format(value || 0);

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const month = moment().subtract(index, "months");
  return {
    value: month.format("YYYY-MM"),
    label: month.format("MMMM YYYY"),
  };
});

const UserGrowth = ({ className }) => {
  const [selectedMonth, setSelectedMonth] = useState("last-12-months");
  const {
    data: growthData,
    isFetching: growthLoading,
    isError: growthError,
  } = useUserGrowthQuery({
    month: selectedMonth === "last-12-months" ? undefined : selectedMonth,
  });

  const growthResults = growthData?.data?.points || [];
  const granularity = growthData?.data?.granularity || "month";
  const totalGrowth = growthResults.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0,
  );

  return (
    <Card className={cn("min-w-0 w-full max-w-full flex flex-col justify-between", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title variant="md">User Growth</Title>
          <Text variant="sm" className="mt-1">
            {formatNumber(totalGrowth)} users joined in the selected window.
          </Text>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger
            className="!h-11 w-[156px] rounded-xl border-slate-200 bg-white px-3 shadow-none"
            aria-label="Filter user growth by month"
          >
            <SelectValue placeholder="Last 12 Months" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl border-slate-200">
            <SelectItem value="last-12-months">Last 12 Months</SelectItem>
            {MONTH_OPTIONS.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <UserGrowthChart
        data={growthResults}
        granularity={granularity}
        isLoading={growthLoading}
        isError={growthError}
      />
    </Card>
  );
};

const UserGrowthChart = ({ data, granularity, isLoading, isError }) => {
  const [chartContainer, setChartContainer] = useState(null);
  const [width, setWidth] = useState(640);
  const height = 320;
  const padding = { top: 22, right: 20, bottom: 42, left: 42 };
  const points = data || [];
  const maxCount = Math.max(...points.map((item) => item.count), 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const chartPoints = points.map((item, index) => {
    const x =
      points.length <= 1
        ? padding.left + innerWidth / 2
        : padding.left + (index / (points.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (item.count / maxCount) * innerHeight;
    return {
      ...item,
      x,
      y,
    };
  });
  const path = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = chartPoints.length
    ? `${path} L ${chartPoints[chartPoints.length - 1].x} ${height - padding.bottom} L ${chartPoints[0].x} ${height - padding.bottom} Z`
    : "";
  const labelStep = Math.max(1, Math.ceil(chartPoints.length / 6));

  useEffect(() => {
    if (!chartContainer) return undefined;

    const updateWidth = () => setWidth(chartContainer.clientWidth || 640);
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(chartContainer);

    return () => resizeObserver.disconnect();
  }, [chartContainer]);

  if (isLoading) {
    return (
      <div className="mt-5 h-[260px] animate-pulse rounded-2xl bg-slate-100" />
    );
  }

  if (isError) {
    return (
      <div className="mt-5 flex h-[300px] items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-sm font-semibold text-red-700">
        Unable to load user growth data.
      </div>
    );
  }

  if (!chartPoints.length) {
    return (
      <div className="mt-5 flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
        No user growth data available.
      </div>
    );
  }

  return (
    <div
      ref={setChartContainer}
      className="mt-5 min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-[360px] w-full max-w-full"
      >
        <defs>
          <linearGradient id="user-growth-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3A86FF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3A86FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + innerHeight * ratio;
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 6"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[11px]"
              >
                {Math.round(maxCount * (1 - ratio))}
              </text>
            </g>
          );
        })}
        {areaPath ? <path d={areaPath} fill="url(#user-growth-fill)" /> : null}
        <path
          d={path}
          fill="none"
          stroke="#3A86FF"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {chartPoints.map((point, index) => (
          <g key={`${point.period}-${index}`}>
            <circle cx={point.x} cy={point.y} r="5" fill="#3A86FF" />
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill="#876CF4"
              opacity="0.14"
            />
            {index % labelStep === 0 || index === chartPoints.length - 1 ? (
              <text
                x={point.x}
                y={height - 16}
                textAnchor="middle"
                className="fill-slate-500 text-[11px]"
              >
                {formatGrowthLabel(point.period, granularity, point.label)}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default UserGrowth;
