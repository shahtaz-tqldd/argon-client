import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  Bot,
  Building2,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { createElement } from "react";
import { Link } from "react-router-dom";

import AppLogo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/card";
import { useChatbotListQuery } from "@/features/chatbot/chatbotApiSlice";
import { useNotificationListQuery } from "@/features/notification/notificationApiSlice";
import { useWorkspaceListQuery } from "@/features/workspace/workspaceApiSlice";
import useTitle from "@/hooks/useTitle";
import { duration } from "@/lib/date-time";
import { cn, formatStatus, getInitials, toArray } from "@/lib/utils";
import ChatbotCard from "../workspace/components/chatbot-card";
import { SectionTitle } from "@/components/ui/section";

const ChatbotListPage = () => {
  useTitle("Argon Chatbot — Chatbots");

  const ownedQuery = useChatbotListQuery({});
  const sharedQuery = useChatbotListQuery({ sharedWithMe: true });
  const workspaceQuery = useWorkspaceListQuery({});
  const notificationQuery = useNotificationListQuery({ pageSize: 5 });

  const ownedChatbots = toArray(ownedQuery.data?.data);
  const sharedChatbots = toArray(sharedQuery.data?.data);
  const workspaces = toArray(workspaceQuery.data?.data);
  const notifications = toArray(notificationQuery.data?.data);

  return (
    <section className="mx-auto max-w-7xl space-y-10">
      <AppLogo />
      <header className="max-w-2xl">
        <SectionTitle
          title="Your AI workspace"
          details="Jump back into a chatbot, move between workspaces, and keep up with
          recent activity."
          lg
        />
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
        <main className="min-w-0 space-y-8">
          <ChatbotSection
            title="My chatbots"
            description="Chatbots you own and manage."
            chatbots={ownedChatbots}
            query={ownedQuery}
            emptyTitle="No chatbots yet"
            emptyDescription="Create a chatbot from one of your workspaces to see it here."
          />
          <ChatbotSection
            title="Shared with me"
            description="Chatbots other teams have invited you to."
            chatbots={sharedChatbots}
            query={sharedQuery}
            emptyTitle="Nothing shared yet"
            emptyDescription="Chatbots shared by other workspace members will appear here."
            showCreated
            showWorkspace
          />
        </main>

        <aside className="space-y-6 xl:sticky xl:top-0">
          <WorkspaceList workspaces={workspaces} query={workspaceQuery} />
          <NotificationList
            notifications={notifications}
            query={notificationQuery}
          />
        </aside>
      </div>
    </section>
  );
};

const ChatbotSection = ({
  title,
  description,
  chatbots,
  query,
  emptyTitle,
  emptyDescription,
  showWorkspace = false,
  showCreated = false,
}) => {
  const titleId = `${title.replaceAll(" ", "-").toLowerCase()}-title`;

  return (
    <section aria-labelledby={titleId}>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 id={titleId} className="text-lg font-semibold text-foreground">
            {title}
          </h2>
          {!query.isLoading && !query.isError && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {chatbots.length}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {query.isLoading ? (
        <ChatbotSkeleton />
      ) : query.isError ? (
        <InlineError label="chatbots" onRetry={query.refetch} />
      ) : chatbots.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {chatbots.map((chatbot, index) => (
            <ChatbotCard
              key={chatbot.slug || chatbot.id}
              chatbot={chatbot}
              colorIndex={index}
              showWorkspace={showWorkspace}
              showCreated={showCreated}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bot}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </section>
  );
};

const WorkspaceList = ({ workspaces, query }) => (
  <SectionCard
    icon={Building2}
    title="Workspaces"
    description="Teams you belong to"
    className="shadow-sm"
    childClassName="p-2"
  >
    {query.isLoading ? (
      <ListSkeleton rows={3} />
    ) : query.isError ? (
      <InlineError label="workspaces" onRetry={query.refetch} compact />
    ) : workspaces.length ? (
      <div className="space-y-1">
        {workspaces.map((workspace) => (
          <Link
            key={workspace.id || workspace.slug}
            to={`/workspace/${workspace.slug}`}
            className="group flex items-center gap-3 rounded-2xl p-3 transition hover:bg-primary/[0.06]"
          >
            <WorkspaceLogo workspace={workspace} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {workspace.name}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>
                  {formatStatus(workspace.current_user_role || "member")}
                </span>
                <span aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3" /> {workspace.member_count || 0}
                </span>
              </div>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={Building2}
        title="No workspaces"
        description="Your workspaces will appear here."
        compact
      />
    )}
  </SectionCard>
);

const WorkspaceLogo = ({ workspace }) => (
  <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/10 text-xs font-bold text-primary">
    {workspace.logo ? (
      <img
        src={workspace.logo}
        alt={`${workspace.name} logo`}
        className="size-full object-cover"
      />
    ) : (
      getInitials(workspace.name)
    )}
  </span>
);

const NotificationList = ({ notifications, query }) => {
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  return (
    <SectionCard
      icon={Bell}
      title="Important alerts"
      description={
        query.isLoading
          ? "Checking for updates…"
          : unreadCount
            ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
            : "Your latest notifications"
      }
      className="shadow-sm"
      childClassName="p-2"
    >
      {query.isLoading ? (
        <ListSkeleton rows={3} />
      ) : query.isError ? (
        <InlineError label="alerts" onRetry={query.refetch} compact />
      ) : notifications.length ? (
        <div className="space-y-1">
          {notifications.map((notification) => (
            <NotificationItem
              key={
                notification.id ||
                `${notification.title}-${notification.created_at}`
              }
              notification={notification}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="New notifications will appear here."
          compact
        />
      )}
    </SectionCard>
  );
};

const NotificationItem = ({ notification }) => {
  const isAiNotification = notification.notification_type === "ai_notification";
  const isMessageNotification =
    notification.notification_type === "new_message";
  const Icon = isAiNotification
    ? Sparkles
    : isMessageNotification
      ? MessageSquare
      : AlertCircle;

  return (
    <div className="flex items-start gap-3 rounded-2xl p-3 hover:bg-muted/60">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          isAiNotification
            ? "bg-violet-500/10 text-violet-600"
            : isMessageNotification
              ? "bg-blue-500/10 text-blue-600"
              : "bg-amber-500/10 text-amber-600",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-xs font-semibold leading-5 text-foreground">
            {notification.title || "New notification"}
          </p>
          {!notification.is_read && (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        {notification.message && (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
            {notification.message}
          </p>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground/80">
          {notification.created_at
            ? duration(notification.created_at)
            : "Recently"}
        </p>
      </div>
    </div>
  );
};

const ChatbotSkeleton = () => (
  <div
    className="grid animate-pulse gap-4 md:grid-cols-2"
    aria-label="Loading chatbots"
  >
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={index} className="h-56 rounded-3xl bg-muted/70" />
    ))}
  </div>
);

const ListSkeleton = ({ rows }) => (
  <div className="animate-pulse space-y-2 p-1" aria-label="Loading">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="h-16 rounded-2xl bg-muted/70" />
    ))}
  </div>
);

const InlineError = ({ label, onRetry, compact = false }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 px-5 text-center",
      compact ? "min-h-36" : "min-h-56",
    )}
  >
    <AlertCircle className="size-5 text-muted-foreground" />
    <p className="mt-2 text-sm font-semibold">Couldn’t load {label}</p>
    <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
      <RefreshCw /> Try again
    </Button>
  </div>
);

const EmptyState = ({ icon, title, description, compact = false }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 px-5 text-center",
      compact ? "min-h-36" : "min-h-56",
    )}
  >
    <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      {createElement(icon, { className: "size-5" })}
    </span>
    <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
    <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
      {description}
    </p>
  </div>
);

export default ChatbotListPage;
