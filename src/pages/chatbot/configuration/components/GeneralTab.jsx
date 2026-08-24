import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Building2,
  CalendarDays,
  Database,
  Globe2,
  Headphones,
  Languages,
  Lock,
  MessageSquareText,
  Pencil,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  UserRoundPlus,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { LANGUAGES } from "@/constants/language";
import { getCloudinaryPreviewUrl } from "@/lib/image";
import { cn, formatStatus, getInitials } from "@/lib/utils";

import {
  SectionCard,
  ToggleControl,
  ValueRow,
} from "./shared";
import { SectionTitle } from "@/components/ui/section";

const DetailItem = ({ icon, label, value }) => {
  const DetailIcon = icon;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border bg-muted/10 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <DetailIcon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  enabled,
  locked,
  disabled,
  onToggle,
  upgradePath,
}) => {
  const FeatureIcon = icon;

  return (
    <div
      className={cn(
        "group flex min-h-20 items-center gap-3.5 px-5 py-3.5 transition-colors",
        locked ? "bg-muted/[0.12]" : "hover:bg-muted/20",
      )}
      aria-busy={disabled || undefined}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
          locked
            ? "bg-muted text-muted-foreground"
            : enabled
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground group-hover:text-foreground",
        )}
      >
        <FeatureIcon className="size-[18px]" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {locked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              <Lock className="size-2.5" />
              Pro
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {locked ? (
          <Link
            to={upgradePath}
            className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs font-semibold text-primary shadow-xs transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Upgrade
            <ArrowUpRight className="size-3.5" />
          </Link>
        ) : (
          <ToggleControl
            checked={enabled}
            onChange={onToggle}
            disabled={disabled}
            label={`${enabled ? "Disable" : "Enable"} ${title}`}
          />
        )}
        {!locked && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-semibold",
              enabled ? "text-emerald-600" : "text-muted-foreground",
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {enabled ? "On" : "Off"}
          </span>
        )}
      </div>
    </div>
  );
};

const GeneralTabSkeleton = () => (
  <div className="space-y-6" aria-label="Loading chatbot details">
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="animate-pulse p-0">
        <div className="h-20 border-b bg-muted/30" />
        <div className="flex gap-5 p-6">
          <div className="size-24 rounded-3xl bg-muted" />
          <div className="flex-1 space-y-3 py-2">
            <div className="h-5 w-44 rounded bg-muted" />
            <div className="h-3 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
        <div className="grid gap-4 border-t p-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 rounded-2xl bg-muted" />
          ))}
        </div>
      </Card>
      <Card className="animate-pulse p-0">
        <div className="h-20 border-b bg-muted/30" />
        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex h-20 items-center gap-4 px-5">
              <div className="size-10 shrink-0 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-muted" />
                <div className="h-2.5 w-3/4 rounded bg-muted" />
              </div>
              <div className="h-6 w-11 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const GeneralTab = ({
  chatbot,
  aiSettings,
  isLoading,
  isError,
  isFeatureUpdating,
  edit,
  onRetry,
  onToggleFeature,
}) => {
  if (isLoading && !chatbot) return <GeneralTabSkeleton />;

  if (isError && !chatbot) {
    return (
      <Card className="flex flex-col items-center px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Bot className="size-5" />
        </span>
        <h2 className="mt-4 text-base font-bold">Unable to load chatbot</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          We couldn’t load the current chatbot details. Check your connection
          and try again.
        </p>
        <Button className="mt-5" variant="outline" onClick={onRetry}>
          <RefreshCw />
          Try again
        </Button>
      </Card>
    );
  }

  if (!chatbot) return null;

  const language =
    LANGUAGES.find((item) => item.value === chatbot.language)?.label ||
    chatbot.language ||
    "Not set";
  const status = formatStatus(chatbot.status);
  const isActive = chatbot.status === "active";
  const features = [
    {
      key: "human-handoff",
      icon: Headphones,
      title: "Human handoff",
      description:
        "Move conversations to a teammate when customers need a person.",
      enabled: Boolean(chatbot.human_handoff_enabled),
      disabled: isFeatureUpdating,
      onToggle: (enabled) =>
        onToggleFeature("human_handoff_enabled", enabled),
    },
    {
      key: "knowledge-base",
      icon: Database,
      title: "Knowledge base",
      description:
        "Ground AI answers in the files, websites, and content you provide.",
      enabled: Boolean(chatbot.knowledge_base_enabled),
      disabled: isFeatureUpdating,
      onToggle: (enabled) =>
        onToggleFeature("knowledge_base_enabled", enabled),
    },
    {
      key: "lead-collection",
      icon: UserRoundPlus,
      title: "Lead collection",
      description:
        "Capture qualified contact details directly from conversations.",
      locked: true,
    },
    {
      key: "appointment-booking",
      icon: CalendarDays,
      title: "Appointment booking",
      description:
        "Let visitors book time with your team without leaving the chat.",
      locked: true,
    },
  ];

  return (
    <div className="space-y-7">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-0">
          <div className="flex flex-col gap-4 border-b bg-muted/15 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold">Chatbot details</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                The core information used across your chatbot and workspace.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600",
                )}
              >
                <span className="size-2 rounded-full bg-current" />
                {status}
              </span>
              <Button
                onClick={() => edit("details")}
                variant="ghost"
                size="icon-sm"
                aria-label="Edit chatbot details"
              >
                <Pencil />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center">
            <span className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-primary/10 text-2xl font-bold text-primary ring-1 ring-primary/10">
              {chatbot.logo ? (
                <img
                  src={getCloudinaryPreviewUrl(chatbot.logo, 240)}
                  alt={`${chatbot.name} logo`}
                  className="size-full object-cover"
                />
              ) : (
                getInitials(chatbot.name)
              )}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{chatbot.name}</h1>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                  {formatStatus(chatbot.current_user_role || "member")}
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {chatbot.description || "No description has been added yet."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 border-t px-6 py-6 md:grid-cols-3">
            <DetailItem icon={Languages} label="Language" value={language} />
            <DetailItem
              icon={Globe2}
              label="Timezone"
              value={chatbot.timezone || "Not set"}
            />
            <DetailItem
              icon={Building2}
              label="Workspace"
              value={chatbot.workspace?.name || "Not set"}
            />
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between gap-4 border-b bg-muted/15 px-6 py-5">
            <div className="flex min-w-0 items-start gap-3">
              <SectionTitle
                title="Features"
                details="Manage your chatbot’s capabilities and available upgrades."
              />
            </div>
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary sm:inline-flex">
              <span className="size-1.5 rounded-full bg-current" />
              {features.filter((feature) => feature.enabled).length} active
            </span>
          </div>
          <div className="divide-y">
            {features.map((feature) => (
              <FeatureCard
                key={feature.key}
                {...feature}
                upgradePath={`/chatbot/${chatbot.slug}/plan-and-billing`}
              />
            ))}
          </div>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <BrainCircuit className="size-4 text-primary" />
          <div>
            <h2 className="text-base font-bold">AI & conversation behavior</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Control how your chatbot responds, communicates, and hands off
              conversations.
            </p>
          </div>
        </div>
        <div className="grid items-stretch gap-5 lg:grid-cols-2">
          <SectionCard
            icon={BrainCircuit}
            title="AI behavior"
            description="Instructions and response tone for AI-generated replies."
            onEdit={() => edit("ai")}
          >
            <div className="divide-y">
              <ValueRow
                label="AI replies"
                value={aiSettings.aiEnabled ? "Enabled" : "Disabled"}
              />
              <ValueRow label="Tone" value={aiSettings.tone} />
            </div>
            <div className="mt-3 rounded-2xl border bg-muted/20 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                AI instructions
              </p>
              <p className="mt-2 line-clamp-3 text-xs leading-5">
                {aiSettings.instructions || "No AI instructions added yet."}
              </p>
            </div>
          </SectionCard>

          <SectionCard
            icon={ShieldAlert}
            title="Escalation & guardrails"
            description="Define when AI should hand off and what it must avoid."
            onEdit={() => edit("escalation")}
          >
            <div className="space-y-3">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Escalate when
                </p>
                <p className="mt-2 line-clamp-3 text-xs leading-5">
                  {aiSettings.escalationRule}
                </p>
              </div>
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Never answer
                </p>
                <p className="mt-2 line-clamp-3 text-xs leading-5">
                  {aiSettings.neverAnswer}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={MessageSquareText}
            title="Conversation messages"
            description="Welcome visitors and provide a consistent fallback response."
            onEdit={() => edit("messages")}
            className="lg:col-span-2"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Welcome message
                </p>
                <p className="mt-2 text-sm leading-6">
                  {aiSettings.welcome || "No welcome message added yet."}
                </p>
              </div>
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Fallback response
                </p>
                <p className="mt-2 text-sm leading-6">
                  {aiSettings.fallback || "No fallback response added yet."}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  );
};

export default GeneralTab;
