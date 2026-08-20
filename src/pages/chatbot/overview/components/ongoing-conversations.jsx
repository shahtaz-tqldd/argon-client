import { ArrowUpRight, MessageCircle, Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusStyles = {
  "AI handling": "bg-primary/10 text-primary",
  "Needs attention": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Assigned to you": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

const ConversationRow = ({ conversation }) => (
  <li className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-muted/30 sm:flex-row sm:items-center sm:px-6">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="relative shrink-0">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {conversation.initials}
        </span>
        <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{conversation.name}</p>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", statusStyles[conversation.status])}>
            {conversation.status}
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">{conversation.channel}</span>
          <span className="mx-1.5">·</span>
          {conversation.lastMessage}
        </p>
      </div>
    </div>

    <div className="flex items-center justify-between gap-3 pl-14 sm:justify-end sm:pl-0">
      <div className="flex items-center gap-2">
        {conversation.unread > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {conversation.unread}
          </span>
        )}
        <span className="w-7 text-right text-xs text-muted-foreground">{conversation.time}</span>
      </div>
      <Button size="sm" variant="outline" aria-label={`Open conversation with ${conversation.name}`}>
        Open <ArrowUpRight />
      </Button>
    </div>
  </li>
);

const OngoingConversations = ({ conversations }) => (
  <Card className="p-0">
    <div className="flex items-center justify-between gap-4 border-b border-border p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageCircle className="size-5" />
          <Radio className="absolute -right-1 -top-1 size-3.5" />
        </span>
        <div>
          <h2 className="font-bold text-foreground">Ongoing conversations</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{conversations.length} active right now</p>
        </div>
      </div>
      <Button variant="ghost" size="sm">View all</Button>
    </div>

    <ul className="divide-y divide-border">
      {conversations.map((conversation) => (
        <ConversationRow key={conversation.id} conversation={conversation} />
      ))}
    </ul>
  </Card>
);

export default OngoingConversations;
