import {
  FileUp,
  MessageCircle,
  MessageCircleMore,
  Mic,
  Paperclip,
  Plus,
  Send,
  Settings2,
  UserRound,
} from "lucide-react";

import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WidgetPreview = ({ settings, chatbot }) => {
  const dark = settings.theme === "dark";
  const onLeft = settings.launcherPosition === "bottom_left";
  const horizontalPosition = onLeft ? "left-5" : "right-5";
  const title = settings.headerTitle || chatbot.chatbot_name || "Chat with us";
  const description =
    settings.headerDescription || "Typically replies instantly";
  const exampleMessages = [
    {
      id: "welcome",
      sender: "bot",
      message: chatbot.welcomeMessage || "Hi! How can I help you?",
    },
    {
      id: "user-services",
      sender: "user",
      message: "Can you tell me more about your services?",
    },
    {
      id: "bot-services",
      sender: "bot",
      message: "Of course! What would you like to know?",
    },
    {
      id: "user-start",
      sender: "user",
      message: "How quickly can I get started?",
    },
    {
      id: "bot-start",
      sender: "bot",
      message: "You can get started today. I’ll guide you through it.",
    },
  ];

  return (
    <Card className="sticky top-0 p-0">
      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">Live preview</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Updates while you edit the widget settings.
            </p>
          </div>
          {!settings.isEnabled && (
            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
              Disabled
            </span>
          )}
        </div>
      </div>
      <div
        className={cn(
          "relative h-[620px] overflow-hidden p-5",
          dark ? "bg-slate-950" : "bg-slate-100",
        )}
      >
        <div className="space-y-3 opacity-60">
          <div
            className={cn(
              "h-7 w-28 rounded",
              dark ? "bg-slate-700" : "bg-slate-300",
            )}
          />
          <div
            className={cn(
              "h-3 w-3/4 rounded",
              dark ? "bg-slate-700" : "bg-slate-300",
            )}
          />
          <div
            className={cn(
              "h-3 w-1/2 rounded",
              dark ? "bg-slate-700" : "bg-slate-300",
            )}
          />
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div
              className={cn(
                "h-24 rounded-xl",
                dark ? "bg-slate-800" : "bg-white",
              )}
            />
            <div
              className={cn(
                "h-24 rounded-xl",
                dark ? "bg-slate-800" : "bg-white",
              )}
            />
          </div>
        </div>

        <div
          className={cn(
            "absolute bottom-20 w-[340px] overflow-hidden rounded-2xl shadow-2xl",
            horizontalPosition,
            dark ? "bg-slate-900 text-white" : "bg-white text-slate-900",
          )}
        >
          <div
            className="p-4"
            style={{
              backgroundColor: settings.primaryColor,
              color: settings.secondaryColor,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 center">
                {chatbot.logo ? (
                  <img
                    src={chatbot.logo}
                    alt="Widget logo"
                    className="size-full object-contain"
                  />
                ) : (
                  <img
                    src="/logo.webp"
                    alt="Chatbot"
                    className="object-contain"
                  />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{title}</p>
                <p className="truncate text-xs opacity-90">{description}</p>
              </div>
            </div>
          </div>
          <div className="custom-scrollbar h-80 space-y-3 overflow-y-auto p-4">
            {exampleMessages.map((item) => {
              const fromUser = item.sender === "user";

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-end gap-2",
                    fromUser && "flex-row-reverse",
                  )}
                >
                  <span
                    className={cn(
                      "size-6 shrink-0 center",
                      fromUser
                        ? "bg-slate-200 text-slate-600 rounded-full"
                        : "",
                    )}
                  >
                    {fromUser ? (
                      <UserRound className="size-3.5" />
                    ) : chatbot.logo ? (
                      <img
                        src={chatbot.logo}
                        alt="Chatbot"
                        className="object-contain"
                      />
                    ) : (
                      <img
                        src="/logo.webp"
                        alt="Chatbot"
                        className="object-contain"
                      />
                    )}
                  </span>
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3 py-2 text-[11px] leading-4",
                      fromUser
                        ? "rounded-br-sm text-white"
                        : dark
                          ? "rounded-bl-sm bg-slate-800"
                          : "rounded-bl-sm bg-slate-100",
                    )}
                    style={
                      fromUser
                        ? { backgroundColor: settings.primaryColor }
                        : undefined
                    }
                  >
                    {item.message}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-t-slate-200 p-3">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-2 py-2",
                dark ? "bg-slate-800" : "bg-slate-100",
              )}
            >
              {/* Upload file / image */}
              <button
                type="button"
                className="center size-7 shrink-0 rounded-full text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-600"
              >
                <Plus className="size-4" />
              </button>

              {/* Message placeholder */}
              <div className="flex-1 pr-1 text-xs text-slate-400">
                Type your message…
              </div>

              {/* Voice input */}
              <button
                type="button"
                className="center size-7 shrink-0 rounded-full text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-600"
              >
                <Mic className="size-4" />
              </button>

              {/* Send */}
              <button
                type="button"
                className="center size-8 shrink-0 rounded-full bg-primary text-white transition-opacity hover:opacity-90"
              >
                <Send className="size-3.5" />
              </button>
            </div>

            {settings.showBranding && (
              <p className="mt-2 text-center text-[9px] text-slate-400">
                Powered by{" "}
                <a className="text-primary" href="https://argonbot.ai">
                  Argon Chatbot
                </a>
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className={cn(
            "absolute bottom-5 flex items-center gap-2 rounded-full px-3 py-3 text-xs font-bold text-white shadow-lg",
            horizontalPosition,
          )}
          style={{ backgroundColor: settings.primaryColor }}
          tabIndex={-1}
        >
          {chatbot.logo ? (
            <img
              src={chatbot.logo}
              alt="Chatbot launcher"
              className="size-5 object-contain"
            />
          ) : (
            <MessageCircle className="size-4" />
          )}
          {settings.launcherText && <span>{settings.launcherText}</span>}
        </button>
      </div>
    </Card>
  );
};

export default WidgetPreview;
