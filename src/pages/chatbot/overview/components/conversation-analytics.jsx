import { ArrowUpRight, BarChart3, Users } from "lucide-react";

import Card from "@/components/ui/card";

const CHART_WIDTH = 720;
const CHART_HEIGHT = 230;
const CHART_PADDING_X = 28;
const CHART_PADDING_TOP = 24;
const CHART_PADDING_BOTTOM = 36;

const ConversationLineChart = ({ data }) => {
  const maxValue = Math.ceil(Math.max(...data.map(({ value }) => value)) / 100) * 100;
  const chartHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
  const chartWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const points = data.map(({ value }, index) => ({
    x: CHART_PADDING_X + (index / (data.length - 1)) * chartWidth,
    y: CHART_PADDING_TOP + chartHeight - (value / maxValue) * chartHeight,
  }));
  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const areaPath = `M ${points[0].x} ${CHART_HEIGHT - CHART_PADDING_BOTTOM} L ${linePoints.replaceAll(",", " ")} L ${points.at(-1).x} ${CHART_HEIGHT - CHART_PADDING_BOTTOM} Z`;

  return (
    <div className="mt-5 overflow-x-auto">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="min-w-[600px]"
        role="img"
        aria-label="Conversations over the last seven days"
      >
        <defs>
          <linearGradient id="conversation-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.33, 0.66, 1].map((ratio) => {
          const y = CHART_PADDING_TOP + chartHeight * ratio;
          return (
            <line
              key={ratio}
              x1={CHART_PADDING_X}
              x2={CHART_WIDTH - CHART_PADDING_X}
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-border"
              strokeDasharray="4 5"
            />
          );
        })}

        <path d={areaPath} fill="url(#conversation-area)" />
        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map(({ x, y }, index) => (
          <g key={data[index].label}>
            <circle cx={x} cy={y} r="5" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
            <text
              x={x}
              y={CHART_HEIGHT - 9}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {data[index].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const VisitorBreakdown = ({ visitors }) => (
  <div className="flex h-full flex-col rounded-2xl border border-border bg-muted/20 p-5">
    <div className="flex items-center gap-2">
      <Users className="size-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">New vs returning</h3>
    </div>

    <div className="flex flex-1 items-center justify-center py-6">
      <div className="relative size-40">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="13" className="text-muted" />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="13"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${visitors.new} ${100 - visitors.new}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{visitors.new}%</span>
          <span className="text-[11px] text-muted-foreground">new visitors</span>
        </div>
      </div>
    </div>

    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2.5 rounded-full bg-primary" /> New visitors
        </span>
        <span className="font-semibold text-foreground">{visitors.newCount.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2.5 rounded-full bg-muted-foreground/30" /> Returning
        </span>
        <span className="font-semibold text-foreground">{visitors.returningCount.toLocaleString()}</span>
      </div>
    </div>
  </div>
);

const ConversationAnalytics = ({ analytics }) => (
  <Card className="p-0">
    <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BarChart3 className="size-5" />
        </span>
        <div>
          <h2 className="font-bold text-foreground">Conversation analytics</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Conversations over time and visitor behavior</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-foreground">{analytics.totalThisPeriod.toLocaleString()}</span>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight className="size-3" /> {analytics.change}%
        </span>
      </div>
    </div>

    <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_280px] sm:p-6">
      <div className="min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Conversations over time</h3>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </div>
        <ConversationLineChart data={analytics.conversationsOverTime} />
      </div>
      <VisitorBreakdown visitors={analytics.visitors} />
    </div>
  </Card>
);

export default ConversationAnalytics;
