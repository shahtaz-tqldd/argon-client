import { useState } from "react";
import {
  ArrowUpRight,
  Bot,
  Building2,
  CalendarDays,
  Clock3,
  Database,
  Headphones,
  Languages,
  Lock,
  Pencil,
  RefreshCw,
  Trash2,
  TriangleAlert,
  UserRoundPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import ConfirmDialog from "@/components/dialog/confirm-dialog";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section";
import { LANGUAGES } from "@/constants/language";
import { useDeleteChatbotMutation } from "@/features/chatbot/chatbotApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { getCloudinaryPreviewUrl } from "@/lib/image";
import { cn, formatStatus, getInitials } from "@/lib/utils";

import AiBehaviorItem from "./AiBehaviorItem";
import { ToggleControl } from "../components/shared";

const DetailTile = ({ icon, label, value, children }) => {
  const DetailIcon = icon;

  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 center rounded-xl bg-primary/10 text-primary">
        <DetailIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {children || (
          <p className="mt-1 break-words text-sm font-semibold text-foreground">
            {value}
          </p>
        )}
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
            {enabled ? "Active" : "Inactive"}
          </span>
        )}
      </div>
    </div>
  );
};

const CoreDetailsTabSkeleton = () => (
  <div className="space-y-6" aria-label="Loading chatbot details">
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-5 lg:col-span-3">
        <Card className="animate-pulse p-0">
          <div className="h-20 border-b bg-muted/30" />
          <div className="flex gap-5 p-6">
            <div className="size-16 rounded-2xl bg-muted" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-5 w-44 rounded bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
          <div className="grid gap-3 p-5 pt-0 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-2xl bg-muted" />
            ))}
          </div>
        </Card>
        <Card className="animate-pulse space-y-4 p-5">
          <div className="h-12 rounded-2xl bg-muted" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 rounded-3xl bg-muted" />
          ))}
        </Card>
      </div>
      <Card className="animate-pulse p-0 lg:col-span-2">
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

const CoreDetailsTab = ({
  chatbot,
  aiSettings,
  isLoading,
  isError,
  isFeatureUpdating,
  edit,
  onRetry,
  onSaveAiBehavior,
  onToggleSetting,
}) => {
  const [pendingToggle, setPendingToggle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteChatbot, { isLoading: isDeleting }] = useDeleteChatbotMutation();
  const navigate = useNavigate();

  if (isLoading && !chatbot) return <CoreDetailsTabSkeleton />;

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
  const chatbotName = chatbot.chatbot_name || chatbot.name || "";
  const isDeleteConfirmed =
    Boolean(chatbotName) && deleteConfirmation === chatbotName;
  const features = [
    {
      key: "ai-reply",
      icon: Bot,
      title: "AI Reply",
      description: "Enable or disable AI reply in the chatbot",
      enabled: Boolean(chatbot.ai_enabled),
      disabled: isFeatureUpdating,
      onToggle: (enabled) =>
        setPendingToggle({
          field: "ai_enabled",
          label: "AI Reply",
          enabled,
        }),
    },
    {
      key: "human-handoff",
      icon: Headphones,
      title: "Human handoff",
      description:
        "Move conversations to a teammate when customers need a person.",
      enabled: Boolean(chatbot.human_handoff_enabled),
      disabled: isFeatureUpdating,
      onToggle: (enabled) =>
        setPendingToggle({
          field: "human_handoff_enabled",
          label: "Human handoff",
          enabled,
        }),
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
        setPendingToggle({
          field: "knowledge_base_enabled",
          label: "Knowledge base",
          enabled,
        }),
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
  const behaviorGroups = [
    {
      key: "fallback-response",
      label: "Fallback response",
      value: aiSettings.fallback,
      emptyValue: "No fallback response added yet.",
    },
    {
      key: "escalation-rule",
      label: "Escalate when",
      value: aiSettings.escalationRule,
      emptyValue: "No escalation rule added yet.",
    },
    {
      key: "never-answer",
      label: "Topics AI should not answer",
      value: aiSettings.neverAnswer,
      emptyValue: "No restricted topics added yet.",
    },
    {
      key: "ai-instructions",
      label: "Additional AI Instruction",
      value: aiSettings.instructions,
      emptyValue: "No AI instructions added yet.",
      className: "md:col-span-2",
    },
  ];

  const confirmToggle = async () => {
    if (!pendingToggle) return;

    const updated = await onToggleSetting(
      pendingToggle.field,
      pendingToggle.enabled,
    );
    if (updated) setPendingToggle(null);
  };

  const handleDeleteDialogOpen = (open) => {
    if (!open) setDeleteConfirmation("");
    setDeleteDialogOpen(open);
  };

  const confirmDelete = async () => {
    if (!chatbot.slug || !isDeleteConfirmed || isDeleting) return;

    try {
      await deleteChatbot({ chatbotSlug: chatbot.slug }).unwrap();
      toast.success("Chatbot deleted successfully");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete the chatbot."));
    }
  };

  return (
    <div className="space-y-7">
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <Card className="p-0">
            <div className="flex flex-col gap-4 border-b bg-muted/15 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle
                title="Chatbot details"
                details="The core information used across your chatbot and workspace."
              />
              <Button
                onClick={() => edit("details")}
                variant="ghost"
                size="icon-sm"
                aria-label="Edit chatbot details"
              >
                <Pencil />
              </Button>
            </div>

            <div className="flex flex-col gap-5 p-5 sm:flex-row">
              <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-2xl font-bold text-primary ring-1 ring-primary/10">
                {chatbot.logo ? (
                  <img
                    src={getCloudinaryPreviewUrl(chatbot.logo, 240)}
                    alt={`${chatbot.chatbot_name} logo`}
                    className="size-full object-cover"
                  />
                ) : (
                  getInitials(chatbot.chatbot_name)
                )}
              </span>
              <div className="w-full">
                <div className="flex justify-between">
                  <div>
                    <div className="flx gap-3">
                      <h1 className="text-lg font-bold">
                        {chatbot.chatbot_name}
                      </h1>
                      <StatusBadge>{status}</StatusBadge>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-primary">
                      <Building2 size={14} />
                      {chatbot.workspace?.name || "Not set"}
                    </div>
                  </div>
                </div>

                <p className="mt-3.5 leading-7 text-muted-foreground">
                  {chatbot.description || "No description has been added yet."}
                </p>
                <div className="mt-8 mb-5 grid grid-cols-2 gap-3">
                  <DetailTile
                    icon={Languages}
                    label="Language"
                    value={language}
                  />
                  <DetailTile
                    icon={Clock3}
                    label="Timezone"
                    value={chatbot.timezone || "Not set"}
                  />
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-0">
            <div className="border-b px-6 py-5 flbx">
              <SectionTitle
                title="AI behavior"
                details="Control how your chatbot responds, communicates, and hands off conversations."
              />
            </div>
            <div className="space-y-4 p-4 sm:p-5 ">
              {behaviorGroups.map((item) => (
                <AiBehaviorItem
                  key={item.key}
                  {...item}
                  sectionKey={item.key}
                  isSaving={isFeatureUpdating}
                  onSave={(value) => onSaveAiBehavior(item.key, value)}
                />
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-0">
            <div className="flex items-center justify-between gap-4 border-b bg-muted/15 px-6 py-5">
              <SectionTitle
                title="Features"
                details="Manage your chatbot's capabilities and available upgrades."
              />
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

          <Card className="border-destructive/30 p-0">
            <div className="border-b border-destructive/20 bg-destructive/[0.04] px-6 py-5">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                  <TriangleAlert className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-destructive">
                    Danger zone
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Permanently delete this chatbot and its associated data.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm leading-6 text-muted-foreground">
                This action cannot be undone. All chatbot configuration and
                related data will be permanently removed.
              </p>
              <Button
                className="mt-8 text-red-500 bg-red-500/10 hover:bg-red-500/15"
                variant="secondary"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 />
                Delete chatbot
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(pendingToggle)}
        setOpen={(open) => {
          if (!open && !isFeatureUpdating) setPendingToggle(null);
        }}
        title={`${pendingToggle?.enabled ? "Enable" : "Disable"} ${pendingToggle?.label || "setting"}?`}
        description={`This will ${pendingToggle?.enabled ? "enable" : "disable"} ${pendingToggle?.label?.toLowerCase() || "this setting"} for this chatbot.`}
        confirmText={pendingToggle?.enabled ? "Enable" : "Disable"}
        onConfirm={confirmToggle}
        isLoading={isFeatureUpdating}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        setOpen={handleDeleteDialogOpen}
        title="Delete chatbot permanently?"
        description="This action cannot be undone. Enter the chatbot name below to confirm deletion."
        confirmText="Delete chatbot"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        confirmDisabled={!isDeleteConfirmed}
      >
        <div className="mt-4 space-y-2">
          <label
            htmlFor="delete-chatbot-confirmation"
            className="block text-sm font-medium text-foreground"
          >
            Type <span className="font-bold">{chatbotName}</span> to confirm
          </label>
          <Input
            id="delete-chatbot-confirmation"
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder={chatbotName}
            autoComplete="off"
            spellCheck={false}
            disabled={isDeleting}
            autoFocus
          />
          {deleteConfirmation && !isDeleteConfirmed && (
            <p className="text-xs text-destructive">
              The chatbot name does not match.
            </p>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
};

export default CoreDetailsTab;
