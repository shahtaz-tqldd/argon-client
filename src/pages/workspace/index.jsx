import { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock3,
  MailPlus,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react";

import InviteMemberDialog from "@/components/dialog/invite-member-dialog";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import {
  useGetWorkspaceQuery,
  useInviteWorkspaceMemberMutation,
} from "@/features/workspace/workspaceApiSlice";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import AppLogo from "@/components/ui/logo";

const asArray = (value) => (Array.isArray(value) ? value : []);

const isMemberOnline = (member, currentUserId) => {
  const person = member.user || member;
  return Boolean(
    member.is_online || member.online || person.id === currentUserId,
  );
};

const getInitials = (value) =>
  String(value || "Workspace")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "W";

const formatStatus = (status) =>
  String(status || "draft")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const formatDate = (value) => {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const chatbotStatusStyles = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  draft: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  disabled: "bg-muted text-muted-foreground",
};

const ChatbotStatus = ({ status }) => {
  const normalizedStatus = String(status || "draft").toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        chatbotStatusStyles[normalizedStatus] || chatbotStatusStyles.draft,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {formatStatus(normalizedStatus)}
    </span>
  );
};

const WorkspaceLogo = ({ logo, name }) => (
  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/20 via-primary/10 to-cyan-100 text-xl font-bold text-primary shadow-sm dark:to-cyan-950/50">
    {logo ? (
      <img
        src={logo}
        alt={`${name} logo`}
        className="h-full w-full object-cover"
      />
    ) : (
      getInitials(name)
    )}
  </div>
);

const ChatbotCard = ({ chatbot }) => (
  <article className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
          {chatbot.logo ? (
            <img
              src={chatbot.logo}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Bot className="size-5" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">
            {chatbot.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Updated {formatDate(chatbot.updated_at)}
          </p>
        </div>
      </div>
      <ChatbotStatus status={chatbot.status} />
    </div>

    <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
      {chatbot.description ||
        "Configure this chatbot’s knowledge, behavior, and customer channels."}
    </p>

    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Activity className="size-3.5" />
        {chatbot.status === "active" ? "Ready to respond" : "Setup in progress"}
      </div>
      <button
        type="button"
        className="flex items-center gap-1 text-xs font-semibold text-primary opacity-70 transition group-hover:opacity-100"
      >
        Open <ArrowUpRight className="size-3.5" />
      </button>
    </div>
  </article>
);

const MemberAvatar = ({ member, isOnline }) => {
  const person = member.user || member;
  const name = person.name || person.email;
  const avatar = person.avatar_url || person.avatar || "";

  return (
    <div className="relative shrink-0">
      <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary">
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500" />
      )}
    </div>
  );
};

const MemberRow = ({ member, currentUserId }) => {
  const person = member.user || member;
  const isOnline = isMemberOnline(member, currentUserId);
  const isActive = member.is_active !== false && person.is_active !== false;
  const role = member.role || (member.is_owner ? "Owner" : "Member");

  return (
    <div className="flex items-center gap-3 py-3">
      <MemberAvatar member={member} isOnline={isOnline} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {person.name || person.email}
          </p>
          {String(role).toLowerCase() === "owner" && (
            <ShieldCheck className="size-3.5 shrink-0 text-primary" />
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{person.email}</p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "text-xs font-semibold",
            isOnline
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground",
          )}
        >
          {isOnline ? "Online" : isActive ? "Active" : "Inactive"}
        </p>
        <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">
          {role}
        </p>
      </div>
    </div>
  );
};

const PendingInvitationRow = ({ invitation }) => (
  <div className="flex items-center gap-3 py-3">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
      <Clock3 className="size-4" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-foreground">
        {invitation.email}
      </p>
      <p className="text-xs text-muted-foreground">Invitation sent</p>
    </div>
    <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
      Pending request
    </span>
  </div>
);

const WorkspacePage = () => {
  const { user } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: workspaceResponse,
    isLoading,
    isError,
    refetch,
  } = useGetWorkspaceQuery();
  const [inviteWorkspaceMember, { isLoading: isInviting }] =
    useInviteWorkspaceMemberMutation();

  const workspace = workspaceResponse?.data;
  const chatbots = asArray(workspace?.chatbots);
  const apiMembers = asArray(workspace?.members || workspace?.memberships);
  const apiInvitations = asArray(
    workspace?.pending_invitations || workspace?.invitations,
  ).filter((invitation) => !invitation.accepted_at);

  const members = apiMembers.length
    ? apiMembers
    : workspace?.owner
      ? [
          {
            ...workspace.owner,
            avatar_url:
              workspace.owner.id === user?.id
                ? user?.avatar_url
                : workspace.owner.avatar_url,
            role: "owner",
            is_owner: true,
            is_active: true,
            is_online: workspace.owner.id === user?.id,
          },
        ]
      : [];

  const invitations = [...sentInvitations, ...apiInvitations];
  const pendingInvitations = invitations.filter(
    (invitation, index) =>
      invitations.findIndex(
        (item) => item.id === invitation.id || item.email === invitation.email,
      ) === index,
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredChatbots = chatbots.filter((chatbot) => {
    const matchesStatus =
      statusFilter === "all" || chatbot.status === statusFilter;
    const matchesQuery =
      !normalizedQuery ||
      chatbot.name?.toLowerCase().includes(normalizedQuery) ||
      chatbot.description?.toLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesQuery;
  });

  const chatbotCount = workspace?.chatbot_count ?? chatbots.length;
  const memberCount = workspace?.member_count ?? members.length;

  const setupChecks = [
    Boolean(workspace?.name),
    Boolean(workspace?.logo),
    chatbotCount > 0,
    memberCount > 1 || pendingInvitations.length > 0,
  ];
  const setupProgress = Math.round(
    (setupChecks.filter(Boolean).length / setupChecks.length) * 100,
  );

  const sendInvitation = async (email) => {
    const response = await inviteWorkspaceMember({
      workspaceSlug: workspace.slug,
      email,
    }).unwrap();
    const invitation = response?.data || { email };
    setSentInvitations((current) => [invitation, ...current]);
    toast.success(`Invitation sent to ${invitation.email || email}`);
  };

  const handleCreateChatbot = () => {
    toast.info("The chatbot creation API is not available yet.");
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 pt-2">
        <div className="h-20 rounded-3xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-3xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
          <div className="h-96 rounded-3xl bg-muted" />
          <div className="h-96 rounded-3xl bg-muted" />
        </div>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <Building2 className="size-5" />
          </div>
          <Title variant="md" className="mt-4">
            Workspace unavailable
          </Title>
          <Text variant="sm" className="mt-2">
            We couldn’t load this workspace. Try reconnecting to continue.
          </Text>
          <Button type="button" onClick={refetch} className="mt-5">
            <RefreshCw /> Try again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <section className="space-y-10 max-w-6xl mx-auto">
      <AppLogo />
      <header className="flex flex-col gap-5 pr-14 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <WorkspaceLogo logo={workspace.logo} name={workspace.name} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Title variant="lg" className="truncate">
                {workspace.name}
              </Title>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              <span>{workspace.industry || "General workspace"}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
        <Card className="p-0">
          <div className="border-b border-border p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Chatbots</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Build, publish, and manage assistants for your customers.
                </p>
              </div>
              <Button type="button" onClick={handleCreateChatbot}>
                <Plus /> Create chatbot
              </Button>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {filteredChatbots.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredChatbots.map((chatbot) => (
                  <ChatbotCard
                    key={chatbot.id || chatbot.slug}
                    chatbot={chatbot}
                  />
                ))}
              </div>
            ) : chatbots.length ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/25 px-6 text-center">
                <Search className="size-7 text-muted-foreground" />
                <h3 className="mt-3 font-semibold text-foreground">
                  No matching chatbots
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try changing the search or status filter.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-primary/25 bg-primary/[0.025] px-6 text-center">
                <div className="absolute -right-10 -top-12 size-36 rounded-full bg-primary/5" />
                <div className="absolute -bottom-16 -left-10 size-40 rounded-full bg-cyan-500/5" />
                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bot className="size-7" />
                  <Sparkles className="absolute -right-2 -top-2 size-4" />
                </div>
                <h3 className="relative mt-4 text-lg font-semibold text-foreground">
                  Create your first chatbot
                </h3>
                <p className="relative mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Start with a focused assistant, connect your knowledge, and
                  publish it to your preferred channel.
                </p>
                <Button
                  type="button"
                  className="relative mt-5"
                  onClick={handleCreateChatbot}
                >
                  <Plus /> Create chatbot
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-0">
            <div className="flex items-start justify-between gap-3 border-b border-border p-5">
              <div>
                <h2 className="font-bold text-foreground">Members</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {memberCount} active member{memberCount === 1 ? "" : "s"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteDialogOpen(true)}
              >
                <MailPlus /> Invite member
              </Button>
            </div>

            <div className="divide-y divide-border px-5">
              {members.map((member) => (
                <MemberRow
                  key={member.id || member.user?.id || member.email}
                  member={member}
                  currentUserId={user?.id}
                />
              ))}
              {pendingInvitations.map((invitation) => (
                <PendingInvitationRow
                  key={invitation.id || invitation.email}
                  invitation={invitation}
                />
              ))}
            </div>

            {memberCount > members.length && (
              <p className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
                {memberCount - members.length} more member
                {memberCount - members.length === 1 ? "" : "s"} in this
                workspace
              </p>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">
                  Workspace readiness
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  A few steps help you get the most from Argon.
                </p>
              </div>
              <span className="text-sm font-bold text-primary">
                {setupProgress}%
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${setupProgress}%` }}
              />
            </div>

            <div className="mt-4 space-y-3">
              {[
                ["Name your workspace", setupChecks[0]],
                ["Add a workspace logo", setupChecks[1]],
                ["Create your first chatbot", setupChecks[2]],
                ["Invite a teammate", setupChecks[3]],
              ].map(([label, complete]) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                >
                  {complete ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  ) : (
                    <span className="size-4 shrink-0 rounded-full border border-border" />
                  )}
                  <span className={cn(complete && "text-foreground")}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-primary/5 p-3 text-xs text-muted-foreground">
              <Wifi className="size-4 shrink-0 text-primary" />
              Presence and member activity appear here in real time when
              available.
            </div>
          </Card>
        </div>
      </div>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={sendInvitation}
        isLoading={isInviting}
        workspaceName={workspace.name}
      />
    </section>
  );
};

export default WorkspacePage;
