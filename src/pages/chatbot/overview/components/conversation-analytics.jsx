import { BarChart3, Users } from "lucide-react";

import Card from "@/components/ui/card";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { useChatSessionOverviewQuery } from "@/features/chat/chatApiSlice";

const CHART_WIDTH = 720;
const CHART_HEIGHT = 230;
const CHART_PADDING_X = 28;
const CHART_PADDING_TOP = 24;
const CHART_PADDING_BOTTOM = 36;

const formatChartDate = (date) => {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

const ConversationLineChart = ({ data }) => {
  const maxValue = Math.max(1, ...data.map(({ value }) => value));
  const chartHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
  const chartWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const points = data.map(({ value }, index) => ({
    x:
      CHART_PADDING_X +
      (data.length === 1
        ? chartWidth / 2
        : (index / (data.length - 1)) * chartWidth),
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
        aria-label={`Conversations over ${data.length} days`}
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
            <circle
              cx={x}
              cy={y}
              r="5"
              fill="var(--card)"
              stroke="var(--primary)"
              strokeWidth="3"
            />
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

const ConversationAnalytics = () => {
  const { chatbotSlug } = useCurrentChatbot();
  const { data, isLoading, isError } = useChatSessionOverviewQuery(
    { chatbotSlug },
    { skip: !chatbotSlug },
  );
  const overview = data?.data;
  const conversationsOverTime = (overview?.points ?? []).map(
    ({ date, session_count: sessionCount }) => ({
      label: formatChartDate(date),
      value: sessionCount,
    }),
  );

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BarChart3 className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-foreground">
              Conversation analytics
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Conversations over time and visitor behavior
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Conversations over time
            </h3>
            <span className="text-xs text-muted-foreground">
              {conversationsOverTime.length
                ? `Last ${conversationsOverTime.length} days`
                : "Last 14 days"}
            </span>
          </div>
          {isLoading ? (
            <div className="mt-5 flex h-[230px] items-center justify-center text-sm text-muted-foreground">
              Loading conversation data…
            </div>
          ) : isError ? (
            <div className="mt-5 flex h-[230px] items-center justify-center text-sm text-destructive">
              Unable to load conversation data.
            </div>
          ) : conversationsOverTime.length ? (
            <ConversationLineChart data={conversationsOverTime} />
          ) : (
            <div className="mt-5 flex h-[230px] items-center justify-center text-sm text-muted-foreground">
              No conversation data available.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ConversationAnalytics;
