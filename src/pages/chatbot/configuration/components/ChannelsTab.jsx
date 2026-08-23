import { Facebook, Instagram, Link2, MessageCircleMore } from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";

const channelDetails = [
  {
    key: "facebook",
    name: "Facebook",
    icon: Facebook,
    tone: "bg-blue-600 text-white",
    description: "Handle Facebook Messenger conversations in Inbox.",
  },
  {
    key: "instagram",
    name: "Instagram",
    icon: Instagram,
    tone: "bg-gradient-to-br from-fuchsia-500 to-amber-400 text-white",
    description: "Reply to Instagram direct messages from Argon.",
  },
  {
    key: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircleMore,
    tone: "bg-emerald-500 text-white",
    description: "Support customers through your WhatsApp Business number.",
  },
];

const ChannelsTab = ({ config, edit }) => (
  <div>
    <div className="mb-5 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
      <div className="flex gap-3">
        <Link2 className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold">
            Bring every conversation into Inbox
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Argon can answer first on each connected channel and escalate to
            your team when human attention is needed.
          </p>
        </div>
      </div>
    </div>
    <div className="grid gap-5 lg:grid-cols-3">
      {channelDetails.map((channel) => {
        const ChannelIcon = channel.icon;
        const values = config[channel.key];
        const connected = values.status === "Connected";

        return (
          <Card key={channel.key} className="flex min-h-72 flex-col p-5">
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl shadow-sm",
                  channel.tone,
                )}
              >
                <ChannelIcon className="size-5" />
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                  connected
                    ? "bg-emerald-500/10 text-emerald-600"
                    : values.status === "Needs attention"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-muted text-muted-foreground",
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {values.status}
              </span>
            </div>
            <h2 className="mt-5 font-bold">{channel.name}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {channel.description}
            </p>
            <div className="mt-5 rounded-xl bg-muted/35 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Connected account
              </p>
              <p className="mt-1 truncate text-xs font-semibold">
                {values.account || "No account connected"}
              </p>
            </div>
            <Button
              onClick={() => edit(channel.key)}
              variant={connected ? "outline" : "default"}
              className="mt-auto w-full"
            >
              <Link2 />
              {connected ? "Manage connection" : "Connect channel"}
            </Button>
          </Card>
        );
      })}
    </div>
  </div>
);

export default ChannelsTab;
