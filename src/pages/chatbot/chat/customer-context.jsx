import { useState } from "react";
import {
  CircleUserRound,
  Clock3,
  Globe,
  Mail,
  MapPin,
  Phone,
  Server,
  Sparkle,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ContextRow,
  ScrollContainer,
  SectionTitle,
} from "@/components/ui/section";
import { getCountryMeta } from "@/lib/countries";
import LeadDetailsDialog from "@/pages/chatbot/lead-collection/lead-list/lead-details-dialog";

const CustomerContext = ({
  chatbotSlug,
  conversation,
  lead,
  open,
  onClose,
}) => {
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const sessionStartPageTitle =
    conversation?.metadata?.page_title || conversation?.metadata?.page_url;
  const sessionStartPageLink = conversation?.metadata?.page_url;
  const userCountry = conversation?.user_metadata?.detected_country;
  const countryMeta = getCountryMeta(userCountry);
  return (
    <>
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
          <section className="border-b px-4 py-3">
            <h3 className="mb-1 text-xs font-bold">Contact details</h3>
            <ContextRow
              icon={UserRound}
              label="Name"
              value={conversation?.user_metadata?.name}
            />
            <ContextRow
              icon={Mail}
              label="Email"
              value={conversation?.user_metadata?.email}
            />
            <ContextRow
              icon={Phone}
              label="Phone"
              value={conversation?.user_metadata?.phone}
            />
            <ContextRow
              icon={MapPin}
              label="Location"
              value={
                conversation.user_metadata?.detected_city ||
                conversation.location
              }
              subrow={
                <p className="mt-1 text-xs flx gap-2">
                  <span>{countryMeta?.flag}</span>
                  <span>{countryMeta?.name}</span>
                </p>
              }
            />
          </section>

          <section className="px-4 py-3">
            <h3 className="mb-1 text-xs font-bold">Session activity</h3>
            <ContextRow
              icon={Sparkle}
              label="Channel"
              value={conversation.channel}
            />
            <ContextRow
              icon={Globe}
              label="Chat Started From"
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
            <ContextRow
              icon={Server}
              label="IP Address"
              value={conversation?.user_metadata?.ip}
            />
          </section>

          {lead?.id && (
            <section className="px-4 py-5">
              <Button
                className="w-full"
                variant="outline"
                disabled={!lead?.id}
                onClick={() => setLeadDialogOpen(true)}
              >
                <CircleUserRound />
                View Lead Profile
              </Button>
            </section>
          )}
        </ScrollContainer>
      </aside>

      {leadDialogOpen && (
        <LeadDetailsDialog
          key={lead.id}
          chatbotSlug={chatbotSlug}
          summary={lead}
          onClose={() => setLeadDialogOpen(false)}
        />
      )}
    </>
  );
};

export default CustomerContext;
