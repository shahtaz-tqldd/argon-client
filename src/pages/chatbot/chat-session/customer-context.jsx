import {
  CircleUserRound,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  MessageCircleMore,
  Phone,
  Tag,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ContextRow({ icon, label, value }) {
  const ContextIcon = icon;
  return (
    <div className="flex gap-3 py-2.5">
      <ContextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 break-words text-xs font-medium">{value}</p>
      </div>
    </div>
  );
}

const CustomerContext = ({
  conversation,
  lead,
  isLeadLoading,
  open,
  onClose,
}) => (
  <aside
    className={cn(
      "custom-scrollbar absolute inset-y-0 right-0 z-30 w-[310px] overflow-y-auto border-l bg-card shadow-2xl transition-transform xl:static xl:z-auto xl:w-[300px] xl:translate-x-0 xl:shadow-none 2xl:w-[330px]",
      open ? "translate-x-0" : "translate-x-full xl:translate-x-0",
    )}
  >
    <div className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b bg-card/95 px-4 backdrop-blur">
      <div>
        <h2 className="text-sm font-bold">Customer context</h2>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Session and lead details
        </p>
      </div>
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon-sm"
        className="xl:hidden"
        aria-label="Close customer context"
      >
        <X />
      </Button>
    </div>

    <div className="border-b px-4 py-5 text-center">
      <span
        className={cn(
          "mx-auto flex size-14 items-center justify-center rounded-full text-sm font-bold",
          conversation.avatarTone,
        )}
      >
        {conversation.initials}
      </span>
      <p className="mt-3 text-sm font-bold">{conversation.name}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {conversation.sessionId} · {conversation.channel}
      </p>
      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
        <Tag className="size-3" />
        {isLeadLoading
          ? "Loading lead…"
          : lead?.status || "Lead details placeholder"}
      </span>
    </div>

    <section className="border-b px-4 py-3">
      <h3 className="mb-1 text-xs font-bold">Contact details</h3>
      <ContextRow
        icon={Mail}
        label="Email"
        value={lead?.email || conversation.email}
      />
      <ContextRow
        icon={Phone}
        label="Phone"
        value={lead?.phone || conversation.phone}
      />
      <ContextRow
        icon={MapPin}
        label="Location"
        value={conversation.location}
      />
    </section>
    <section className="border-b px-4 py-3">
      <h3 className="mb-1 text-xs font-bold">Session activity</h3>
      <ContextRow
        icon={Globe2}
        label="Current page"
        value={conversation.currentPage}
      />
      <ContextRow
        icon={Clock3}
        label="First seen"
        value={conversation.firstSeen}
      />
      <ContextRow
        icon={CircleUserRound}
        label="Last activity"
        value={conversation.lastSeen}
      />
      <ContextRow
        icon={MessageCircleMore}
        label="Channel"
        value={conversation.channel}
      />
    </section>
    <section className="px-4 py-5">
      <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-center">
        <p className="text-xs font-semibold">Lead profile coming soon</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Score, collected fields, notes, and conversation history will appear
          here.
        </p>
      </div>
    </section>
  </aside>
);

export default CustomerContext;
