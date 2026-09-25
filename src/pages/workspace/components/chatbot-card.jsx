import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { Badge, StatusBadge } from "@/components/ui/badge";
import { ChatbotAvatar, PersonAvatar } from "@/components/ui/avatar";
import Card from "@/components/ui/card";

import { getPaletteIndex, toArray } from "@/lib/utils";
import { AVATAR_COLORS } from "@/constants/colors";

const ChatbotCard = ({
  chatbot,
  colorIndex,
  showWorkspace = false,
  showCreated = false,
}) => {
  const members = toArray(chatbot.members);
  const visibleMembers = members.slice(0, 3);
  const remainingMembers = Math.max(members.length - visibleMembers.length, 0);
  const creator = chatbot.created_by;

  const isCreatedByYou =
    String(chatbot.current_user_role).toLowerCase() === "admin";

  const chatbotPaletteIndex = colorIndex % AVATAR_COLORS.length;

  return (
    <Link to={`/chatbot/${chatbot.slug}`} className="block h-full">
      <Card className="p-0 relative group">
        <div className="pointer-events-none absolute -right-10 -bottom-10 size-32 rounded-full bg-blue-100/50 blur-2xl dark:bg-blue-500/10" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            {/* Logo */}
            <ChatbotAvatar chatbot={chatbot} size="lg" />

            <div className="min-w-0">
              {/* Chatbot Name */}
              <h3 className="truncate font-semibold text-foreground">
                {chatbot.chatbot_name}
              </h3>

              {/* Business Name - always shown */}
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {chatbot.business_name || "No business name"}
              </p>
            </div>
          </div>

          <StatusBadge>{chatbot.status || "draft"}</StatusBadge>
        </div>

        {/* Description */}
        <p className="px-4 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
          {chatbot.description ||
            "Configure this chatbot's knowledge, behavior, and customer channels."}
        </p>

        {/* Metadata */}
        <div className="px-4 mt-4 flex flex-wrap items-center gap-1.5">
          {/* Workspace - contextual */}
          {showWorkspace && chatbot.workspace?.name && (
            <Badge>{chatbot.workspace.name}</Badge>
          )}

          {chatbot.subscription_plan_name && (
            <Badge>{chatbot.subscription_plan_name}</Badge>
          )}

          <Badge>{chatbot.ai_enabled ? "AI enabled" : "AI disabled"}</Badge>
        </div>

        {/* Created By - contextual */}
        {showCreated && (
          <div className="px-4 mt-3">
            {isCreatedByYou ? (
              <p className="text-xs text-muted-foreground">Created by you</p>
            ) : (
              <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <PersonAvatar
                  person={creator}
                  index={getPaletteIndex(
                    creator?.name || creator?.email,
                    AVATAR_COLORS,
                  )}
                  size="xs"
                  // className="size-5 ring-1"
                />

                <span className="truncate">
                  Created by {creator?.name || creator?.email || "Unknown"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
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
                      (chatbotPaletteIndex + index + 1) % AVATAR_COLORS.length
                    }
                    size="sm"
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
            Open Chatbot
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
};

export default ChatbotCard;
