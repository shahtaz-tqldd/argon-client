import {
  CircleUserRound,
  Clock3,
  Globe,
  Mail,
  MapPin,
  Phone,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmBadge } from "@/components/ui/badge";
import {
  ContextRow,
  ScrollContainer,
  SectionTitle,
} from "@/components/ui/section";
import { getCountryMeta } from "@/lib/countries";

const CustomerContext = ({ conversation, lead, open, onClose }) => {
  const sessionStartPageTitle =
    conversation?.metadata?.page_title || conversation?.metadata?.page_url;
  const sessionStartPageLink = conversation?.metadata?.page_url;
  const userCountry = conversation?.user_metadata?.detected_country;
  const countryMeta = getCountryMeta(userCountry);

  return (
    <aside
      className={cn(
        "absolute inset-y-0 right-0 z-30 flex w-[310px] flex-col overflow-hidden border-l bg-card shadow-2xl transition-transform xl:static xl:z-auto xl:w-[300px] xl:translate-x-0 xl:shadow-none 2xl:w-[330px]",
        open ? "translate-x-0" : "translate-x-full xl:translate-x-0",
      )}
    >
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b bg-card/95 px-4 backdrop-blur">
        <SectionTitle
          title="Customer Context"
          details="Session and Lead details"
        />
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

      <ScrollContainer>
        <div className="border-b px-4 py-5 text-center">
          <span
            className={cn(
              "mx-auto flex size-14 items-center justify-center rounded-full text-sm font-bold",
              conversation.avatarTone,
            )}
          >
            {conversation.initials}
          </span>
          <p className="mt-2 font-bold">{conversation.name}</p>
          <EmBadge size="xs" variant="transparent">
            <Globe size={11} />
            {conversation.channel}
          </EmBadge>
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
            subrow={
              <p className="mt-1 text-xs flx gap-2">
                <span>{countryMeta?.flag}</span>
                <span>{countryMeta?.name}</span>
              </p>
            }
          />
        </section>

        <section className="border-b px-4 py-3">
          <h3 className="mb-1 text-xs font-bold">Session activity</h3>
          <ContextRow
            icon={Globe}
            label="Current page"
            value={sessionStartPageTitle}
            link={sessionStartPageLink}
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
        </section>

        <section className="px-4 py-5">
          <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-center">
            <p className="text-xs font-semibold">Lead Profile</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Score, collected fields, notes, and conversation history will
              appear here.
            </p>
          </div>
        </section>
      </ScrollContainer>
    </aside>
  );
};

export default CustomerContext;
