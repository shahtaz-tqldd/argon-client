import { useState } from "react";
import { Bot, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateChatbotMutation } from "@/features/chatbot/chatbotApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import { cn } from "@/lib/utils";
import MenuToggle from "./menu-toggle";
import { ChatbotAvatar } from "../ui/avatar";

const CHATBOT_ENABLED_STORAGE_KEY = "argon-chatbot-enabled";
const AI_REPLY_STORAGE_KEY = "argon-ai-reply-enabled";

const getStoredBoolean = (key, fallback = true) => {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue === null ? fallback : storedValue === "true";
  } catch {
    return fallback;
  }
};

const persistBoolean = (key, value) => {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // The preference still works for the current session.
  }
};

const ChatbotMenu = () => {
  const { chatbotSlug, currentChatbot: activeChatbot } = useCurrentChatbot();
  const [updateChatbot, { isLoading: isUpdatingChatbot }] =
    useUpdateChatbotMutation();
  const [storedChatbotEnabled, setStoredChatbotEnabled] = useState(() =>
    getStoredBoolean(CHATBOT_ENABLED_STORAGE_KEY),
  );
  const [chatbotEnabledOverrides, setChatbotEnabledOverrides] = useState({});
  const [isAiReplyEnabled, setIsAiReplyEnabled] = useState(() =>
    getStoredBoolean(AI_REPLY_STORAGE_KEY),
  );

  if (!chatbotSlug) return null;

  const chatbotStateKey = chatbotSlug;
  const serverChatbotEnabled = activeChatbot
    ? activeChatbot.status === "active"
    : storedChatbotEnabled;
  const isChatbotEnabled =
    chatbotEnabledOverrides[chatbotStateKey] ?? serverChatbotEnabled;
  const chatbotName = activeChatbot?.chatbot_name || "Chatbot";

  const handleChatbotEnabledChange = async (nextValue) => {
    setStoredChatbotEnabled(nextValue);
    setChatbotEnabledOverrides((current) => ({
      ...current,
      [chatbotStateKey]: nextValue,
    }));
    persistBoolean(CHATBOT_ENABLED_STORAGE_KEY, nextValue);

    if (!activeChatbot) return;

    try {
      await updateChatbot({
        chatbotSlug,
        payload: { status: nextValue ? "active" : "disabled" },
      }).unwrap();
      toast.success(nextValue ? "Chatbot enabled" : "Chatbot disabled");
    } catch (error) {
      const previousValue = !nextValue;
      setStoredChatbotEnabled(previousValue);
      setChatbotEnabledOverrides((current) => ({
        ...current,
        [chatbotStateKey]: previousValue,
      }));
      persistBoolean(CHATBOT_ENABLED_STORAGE_KEY, previousValue);
      toast.error(getApiErrorMessage(error, "Unable to update the chatbot."));
    }
  };

  const handleAiReplyChange = (nextValue) => {
    setIsAiReplyEnabled(nextValue);
    persistBoolean(AI_REPLY_STORAGE_KEY, nextValue);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={"Manage " + chatbotName}
          className="group flex w-full items-center gap-2.5 rounded-full border border-primary/20 bg-background/60 p-2.5 text-left outline-none transition-all hover:border-primary/30 hover:bg-background focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=open]:border-primary/30 data-[state=open]:bg-background"
        >
          <ChatbotAvatar chatbot={activeChatbot} size="md" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              {chatbotName}
            </span>
            <span
              className={cn(
                "mt-0.5 flex items-center gap-1.5 text-[11px] font-medium",
                isChatbotEnabled ? "text-emerald-600" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isChatbotEnabled
                    ? "bg-emerald-500"
                    : "bg-muted-foreground/60",
                )}
              />
              {isChatbotEnabled ? "Active" : "Inactive"}
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="end"
        sideOffset={12}
        className="w-[310px] rounded-2xl border-border/80 p-2 shadow-xl"
      >
        {/* <div className="flex items-center gap-3 px-3 py-3">
          <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-sm font-bold text-primary">
            {chatbotLogo ? (
              <img
                src={getCloudinaryPreviewUrl(chatbotLogo, 120)}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              getInitials(chatbotName)
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{chatbotName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Chatbot controls
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold",
              isChatbotEnabled
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isChatbotEnabled ? "Active" : "Inactive"}
          </span>
        </div>

        <DropdownMenuSeparator /> */}

        <div className="space-y-0.5 py-1">
          <MenuToggle
            checked={isChatbotEnabled}
            disabled={isUpdatingChatbot}
            icon={<Bot className="size-4" />}
            label="Enable chatbot"
            description={
              isChatbotEnabled
                ? "Available to receive messages"
                : "Hidden from your connected channels"
            }
            onChange={handleChatbotEnabledChange}
          />
          <MenuToggle
            checked={isAiReplyEnabled}
            icon={<Sparkles className="size-4" />}
            label="AI replies"
            description={
              isAiReplyEnabled
                ? "AI can respond automatically"
                : "Only teammates can send replies"
            }
            onChange={handleAiReplyChange}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatbotMenu;
