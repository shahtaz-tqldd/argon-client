import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Bot,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Card from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section";
import { useChatbotListQuery } from "@/features/chatbot/chatbotApiSlice";
import { formatDate } from "@/lib/date-time";

import CreateChatbotDialog from "./create-chatbot";
import { toArray } from "@/lib/utils";

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
      <Card className="p-0">
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <SectionTitle
              title="Chatbots"
              details="Build, publish, and manage assistants for your customers."
            />
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus /> Create chatbot
            </Button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {isLoading ? (
            <ChatbotsLoading />
          ) : isError ? (
            <ChatbotsError onRetry={refetch} />
          ) : chatbots.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {chatbots.map((chatbot) => (
                <ChatbotCard
                  key={chatbot.id || chatbot.slug}
                  chatbot={chatbot}
                />
              ))}
            </div>
          ) : (
            <ChatbotsEmpty onCreate={() => setIsCreateDialogOpen(true)} />
          )}
        </div>
      </Card>

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

const ChatbotCard = ({ chatbot }) => (
  <Link to={`/chatbot/${chatbot.slug}`} className="block">
    <article className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
            {chatbot.logo ? (
              <img
                src={chatbot.logo}
                alt={`${chatbot.name} logo`}
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
        <Badge>{chatbot.status || "draft"}</Badge>
      </div>

      <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
        {chatbot.description ||
          "Configure this chatbot’s knowledge, behavior, and customer channels."}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          {chatbot.member_count ?? 0} member
          {(chatbot.member_count ?? 0) === 1 ? "" : "s"}
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-70 transition group-hover:opacity-100">
          Open <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </article>
  </Link>
);

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
      We couldn’t load your chatbot list.
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
