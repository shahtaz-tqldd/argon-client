import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bot, Plus, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/ui/section";
import { useChatbotListQuery } from "@/features/chatbot/chatbotApiSlice";

import CreateChatbotDialog from "./create-chatbot";
import { cn, getInitials, toArray } from "@/lib/utils";
import Card from "@/components/ui/card";

const avatarColors = [
  "bg-violet-500 text-white",
  "bg-orange-500 text-white",
  "bg-emerald-600 text-white",
  "bg-amber-500 text-amber-950",
  "bg-rose-500 text-white",
  "bg-blue-600 text-white",
];

const getPaletteIndex = (value, palette) => {
  const hash = String(value || "argon")
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return hash % palette.length;
};

const getAvatar = (person) =>
  person?.avatar_url || person?.avatar || person?.image || "";

const PersonAvatar = ({ person, index = 0, className }) => {
  const name = person?.name?.trim() || person?.email || "Team member";
  const avatar = getAvatar(person);

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold ring-2 ring-background",
        avatarColors[index % avatarColors.length],
        className,
      )}
      title={name}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={`${name} avatar`}
          className="size-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
};

const WorkspaceChatbots = ({ workspace, onWorkspaceChange }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const {
    data: chatbotResponse,
    isLoading,
    isError,
    refetch,
  } = useChatbotListQuery();

  const chatbots = toArray(chatbotResponse?.data);

  const refreshAfterCreate = async () => {
    await Promise.all([refetch(), onWorkspaceChange?.()]);
  };

  return (
    <>
      <div>
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <SectionTitle
              title="Your Chatbots"
              details="Build, publish, and manage assistants for your customers."
            />
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus /> Create chatbot
            </Button>
          </div>
        </div>

        <div>
          {isLoading ? (
            <ChatbotsLoading />
          ) : isError ? (
            <ChatbotsError onRetry={refetch} />
          ) : chatbots.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {chatbots.map((chatbot, index) => (
                <ChatbotCard
                  key={chatbot.id || chatbot.slug}
                  chatbot={chatbot}
                  colorIndex={index}
                />
              ))}
            </div>
          ) : (
            <ChatbotsEmpty onCreate={() => setIsCreateDialogOpen(true)} />
          )}
        </div>
      </div>

      <CreateChatbotDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        workspaceSlug={workspace.slug}
        workspaceName={workspace.name}
        onCreated={refreshAfterCreate}
      />
    </>
  );
};

const ChatbotCard = ({ chatbot, colorIndex }) => {
  const members = toArray(chatbot.members);
  const visibleMembers = members.slice(0, 3);
  const remainingMembers = Math.max(members.length - visibleMembers.length, 0);
  const creator = chatbot.created_by;
  const isAdmin = String(chatbot.current_user_role).toLowerCase() === "admin";
  const chatbotPaletteIndex = colorIndex % avatarColors.length;

  return (
    <Link to={`/chatbot/${chatbot.slug}`} className="block h-full">
      <Card className="p-0 relative group">
        <div className="pointer-events-none absolute -right-10 -bottom-10 size-32 rounded-full bg-blue-100/50 blur-2xl dark:bg-blue-500/10" />
        <div className="relative flex items-start justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-bold",
                avatarColors[chatbotPaletteIndex],
              )}
            >
              {chatbot.logo ? (
                <img
                  src={chatbot.logo}
                  alt={`${chatbot.chatbot_name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(chatbot.chatbot_name)
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground">
                {chatbot.chatbot_name}
              </h3>
              {isAdmin ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Created by you
                </p>
              ) : (
                <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <PersonAvatar
                    person={creator}
                    index={getPaletteIndex(
                      creator?.name || creator?.email,
                      avatarColors,
                    )}
                    className="size-5 ring-1"
                  />
                  <span className="truncate">
                    Created by {creator?.name || creator?.email || "Unknown"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <StatusBadge>{chatbot.status || "draft"}</StatusBadge>
        </div>

        <p className="px-4 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
          {chatbot.description ||
            "Configure this chatbot's knowledge, behavior, and customer channels."}
        </p>
        <div className="px-4 mt-4 flex flex-wrap gap-1.5">
          <Badge>{chatbot?.subscription_plan_name}</Badge>
          {chatbot.ai_enabled ? (
            <Badge>ai_enabled</Badge>
          ) : (
            <Badge>ai_disabled</Badge>
          )}
        </div>
        <div className="relative z-10 p-4 mt-2.5 flex items-center justify-between border-t border-border/70 pt-3">
          <div className="flex items-center">
            {visibleMembers.length ? (
              <div
                className="flex -space-x-2"
                aria-label={`${members.length} team members`}
              >
                {visibleMembers.map((member, index) => (
                  <PersonAvatar
                    key={member.id || member.email || `${member.name}-${index}`}
                    person={member.user || member}
                    index={
                      (chatbotPaletteIndex + index + 1) % avatarColors.length
                    }
                    className="size-6"
                  />
                ))}
                {remainingMembers > 0 && (
                  <span className="flex size-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-background">
                    +{remainingMembers}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                No team members
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-80 transition group-hover:opacity-100">
            Open Chatbot <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
};

const ChatbotsLoading = () => (
  <div className="grid animate-pulse gap-4 md:grid-cols-2">
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={index} className="h-44 rounded-2xl bg-muted" />
    ))}
  </div>
);

const ChatbotsError = ({ onRetry }) => (
  <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/25 px-6 text-center">
    <Bot className="size-7 text-muted-foreground" />
    <h3 className="mt-3 font-semibold text-foreground">Chatbots unavailable</h3>
    <p className="mt-1 text-sm text-muted-foreground">
      We couldn't load your chatbot list.
    </p>
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-4"
      onClick={onRetry}
    >
      <RefreshCw /> Try again
    </Button>
  </div>
);

const ChatbotsEmpty = ({ onCreate }) => (
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
      Start with a focused assistant, connect your knowledge, and publish it to
      your preferred channel.
    </p>
    <Button type="button" className="relative mt-5" onClick={onCreate}>
      <Plus /> Create chatbot
    </Button>
  </div>
);

export default WorkspaceChatbots;
