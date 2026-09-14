import { AlertCircle, LoaderCircle, Radio, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import useActiveChatbotMembers from "@/hooks/useActiveChatbotMembers";
import { getInitials } from "@/lib/utils";

const MemberAvatar = ({ member }) => (
  <span className="relative block size-10 shrink-0">
    <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
      {member.avatar ? (
        <img
          src={member.avatar}
          alt={`${member.name} avatar`}
          className="size-full object-cover"
        />
      ) : (
        getInitials(member.name)
      )}
    </span>
    <span
      aria-label="Online"
      className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-[3px] border-card bg-emerald-500"
    />
  </span>
);

const ActiveChatbotMembers = ({ chatbotId, chatbotSlug }) => {
  const {
    activeMembers,
    isLoading,
    isFetching,
    isError,
    isPresenceReady,
    refetch,
  } = useActiveChatbotMembers({ chatbotId, chatbotSlug });
  const isPending =
    !isError &&
    (isLoading || !isPresenceReady || (isFetching && !activeMembers.length));

  return (
    <Card className="p-0">
      <section aria-labelledby="active-members-title">
        <div className="flex items-center justify-between gap-4 border-b border-emerald-500/10 bg-emerald-500/[0.04] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="active-members-title" className="font-semibold">
                Active members
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isPresenceReady
                ? `${activeMembers.length} online right now`
                : "Connecting to live presence…"}
            </p>
          </div>
          {isPresenceReady && (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {activeMembers.length} online
            </span>
          )}
        </div>

        {isPending ? (
          <div className="flex h-28 items-center justify-center text-muted-foreground">
            <LoaderCircle className="size-5 animate-spin" />
            <span className="sr-only">Loading chatbot members</span>
          </div>
        ) : isError ? (
          <div className="flex min-h-28 flex-col items-center justify-center px-5 py-4 text-center">
            <AlertCircle className="size-5 text-destructive/70" />
            <p className="mt-2 text-xs text-muted-foreground">
              Couldn’t load chatbot members
            </p>
            <Button
              className="mt-2"
              size="sm"
              variant="outline"
              onClick={refetch}
            >
              Try again
            </Button>
          </div>
        ) : activeMembers.length ? (
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {activeMembers.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <MemberAvatar member={member} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Online
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex min-h-28 flex-col items-center justify-center px-5 py-5 text-center text-muted-foreground">
            <Users className="size-6 opacity-50" />
            <p className="mt-2 text-xs">No team members are online right now</p>
          </div>
        )}
      </section>
    </Card>
  );
};

export default ActiveChatbotMembers;
