import { Bot, Plus, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section";
import { useChatbotListQuery } from "@/features/chatbot/chatbotApiSlice";

import { toArray } from "@/lib/utils";
import ChatbotCard from "./chatbot-card";

const WorkspaceChatbots = ({ workspace, onCreate }) => {
  const {
    data: chatbotResponse,
    isLoading,
    isError,
    refetch,
  } = useChatbotListQuery({ workspaceSlug: workspace?.slug });

  const chatbots = toArray(chatbotResponse?.data);

  return (
    <>
      <div>
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <SectionTitle
              title="Your Chatbots"
              details="Build, publish, and manage assistants for your customers."
            />
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
                  showCreated
                />
              ))}
            </div>
          ) : (
            <ChatbotsEmpty onCreate={onCreate} />
          )}
        </div>
      </div>
    </>
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
