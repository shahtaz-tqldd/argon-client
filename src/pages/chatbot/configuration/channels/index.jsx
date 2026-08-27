import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

const channelDetails = [
  {
    key: "facebook",
    name: "Facebook Messanger",
    img: "/ms.webp",
    tone: "bg-blue-600 text-white",
    description: "Handle Facebook Messenger conversations in Inbox.",
  },
  {
    key: "instagram",
    name: "Instagram",
    img: "/insta.webp",
    tone: "bg-gradient-to-br from-fuchsia-500 to-amber-400 text-white",
    description: "Reply to Instagram direct messages from Argon.",
  },
  {
    key: "whatsapp",
    name: "WhatsApp",
    img: "/wp.webp",
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
        const values = config[channel.key];
        const connected = values.status === "Connected";

        return (
          <Card key={channel.key} className="flex min-h-72 flex-col p-5">
            <div className="flex items-start justify-between">
              <img
                src={channel.img}
                alt={channel.name}
                className="size-8 object-contain"
              />
              <StatusBadge>{values.status}</StatusBadge>
            </div>
            <h2 className="mt-5 font-bold">{channel.name}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {channel.description}
            </p>
            <div className="mt-5 rounded-xl bg-muted p-4">
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
