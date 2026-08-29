import {
  Facebook,
  Flame,
  Globe2,
  Instagram,
  Lightbulb,
  MessageCircleMore,
  Sparkles,
  Target,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { leadTrend, sourcePerformance } from "../demo-data";
const channelMeta = {
  Website: { icon: Globe2, tone: "bg-sky-500/10 text-sky-600" },
  WhatsApp: {
    icon: MessageCircleMore,
    tone: "bg-emerald-500/10 text-emerald-600",
  },
  Instagram: { icon: Instagram, tone: "bg-fuchsia-500/10 text-fuchsia-600" },
  Facebook: { icon: Facebook, tone: "bg-blue-600/10 text-blue-600" },
};

function ChannelLabel({ source }) {
  const meta = channelMeta[source] || channelMeta.Website;
  const ChannelIcon = meta.icon;
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium">
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full",
          meta.tone,
        )}
      >
        <ChannelIcon className="size-3.5" />
      </span>
      {source}
    </span>
  );
}

const LeadAnalyticsTab = () => {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={UsersRound}
          label="Total leads"
          value="286"
          detail="+18.4% from last month"
          tone="bg-primary/10 text-primary"
          badge={
            <span className="text-xs font-semibold text-emerald-600">
              +18.4%
            </span>
          }
        />
        <MetricCard
          icon={UserRoundCheck}
          label="Qualified leads"
          value="88"
          detail="30.8% qualification rate"
          tone="bg-emerald-500/10 text-emerald-600"
          badge={
            <span className="text-xs font-semibold text-emerald-600">+12</span>
          }
        />
        <MetricCard
          icon={Flame}
          label="Hot leads"
          value="54"
          detail="19 need follow-up today"
          tone="bg-red-500/10 text-red-600"
          badge={<span className="size-2 rounded-full bg-red-500" />}
        />
        <MetricCard
          icon={Target}
          label="Conversion rate"
          value="18.4%"
          detail="Lead to booked meeting"
          tone="bg-violet-500/10 text-violet-600"
          badge={
            <span className="text-xs font-semibold text-emerald-600">
              +2.6%
            </span>
          }
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold">Lead growth</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Captured leads over the last 12 weeks
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              +18.4%
            </span>
          </div>
          <div className="mt-7">
            <TrendChart />
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
            <span>Jun 1</span>
            <span>Jun 29</span>
            <span>Jul 27</span>
            <span>Aug 20</span>
          </div>
        </Card>
        <Card>
          <h2 className="text-sm font-bold">Qualification funnel</h2>
          <p className="mt-1 text-xs text-muted-foreground">This month</p>
          <div className="mt-6 space-y-3">
            {[
              ["Captured", 286, 100, "bg-primary"],
              ["Engaged", 194, 68, "bg-sky-500"],
              ["Qualified", 88, 31, "bg-violet-500"],
              ["Meeting booked", 53, 19, "bg-emerald-500"],
            ].map(([label, count, width, color]) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium">{label}</span>
                  <span className="font-bold">{count}</span>
                </div>
                <div className="h-7 overflow-hidden rounded-lg bg-muted">
                  <div
                    className={cn(
                      "flex h-full items-center justify-end rounded-lg px-2 text-[10px] font-semibold text-white",
                      color,
                    )}
                    style={{ width: `${width}%` }}
                  >
                    {width}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold">Source performance</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Qualified conversion by channel
              </p>
            </div>
            <Globe2 className="size-5 text-primary" />
          </div>
          <div className="mt-6 space-y-5">
            {sourcePerformance.map((source) => (
              <div key={source.source}>
                <div className="flex items-center justify-between text-xs">
                  <ChannelLabel source={source.source} />
                  <span className="font-semibold">
                    {source.qualified} qualified · {source.conversion}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", source.color)}
                    style={{ width: `${source.conversion * 2}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {source.leads} total leads
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold">AI lead insights</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Common intent and recommended action
              </p>
            </div>
            <Sparkles className="size-5 text-violet-500" />
          </div>
          <div className="mt-5 rounded-2xl border border-violet-500/15 bg-violet-500/[0.05] p-4">
            <div className="flex gap-3">
              <Lightbulb className="mt-0.5 size-5 shrink-0 text-violet-500" />
              <div>
                <p className="text-xs font-bold">
                  High-intent traffic is shifting to WhatsApp
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  WhatsApp leads convert 14 points higher than website leads.
                  Consider routing hot enquiries directly to sales.
                </p>
                <button className="mt-3 text-xs font-semibold text-violet-600">
                  Create routing rule →
                </button>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ["Pricing & plans", 34],
              ["WhatsApp automation", 27],
              ["Team collaboration", 19],
              ["Security & SSO", 12],
            ].map(([intent, percent]) => (
              <div key={intent} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 text-xs font-medium">
                  {intent}
                </span>
                <span className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-violet-500"
                    style={{ width: `${percent * 2.5}%` }}
                  />
                </span>
                <span className="w-8 text-right text-[11px] font-semibold text-muted-foreground">
                  {percent}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

function TrendChart() {
  const max = Math.max(...leadTrend);
  return (
    <div className="flex h-40 items-end gap-2">
      {leadTrend.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="group flex h-full flex-1 items-end"
        >
          <div
            className="relative w-full rounded-t-md bg-primary/20 transition hover:bg-primary"
            style={{ height: `${(value / max) * 100}%` }}
          >
            <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[9px] text-background group-hover:block">
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricCard({ icon, label, value, detail, tone, badge }) {
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
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 text-[11px] text-muted-foreground">{detail}</p>
    </Card>
  );
}
export default LeadAnalyticsTab;
