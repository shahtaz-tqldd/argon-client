import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { CHAT_CHANNELS } from "@/constants/channels";
import { StatusBadge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// const channelIcons = {
//   facebook: "/ms.webp",
//   whatsapp: "/wp.webp",
//   instagram: "/insta.webp",
// };

const ConnectedChannels = ({ urls, chatbotSlug }) => (
  <Card className="p-0">
    <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 p-5">
      <div>
        <h2 id="connected-channels-title" className="font-bold text-foreground">
          Connected channels
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Meet customers where they message
        </p>
      </div>
      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
        {urls?.filter(({ item }) => item?.is_active).length} live
      </span>
    </div>

    <ul className="divide-y divide-border">
      {urls?.map((item, idx) => {
        const name = "Website";
        const isActive = item.is_active;
        const url = item.url;
        const favicon = `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
        return (
          <li key={idx} className="flex items-center gap-3 py-4 px-5">
            <img
              src={favicon}
              alt={url}
              className="size-10 bg-primary/5 dark:bg-primary/20 rounded-xl p-2 object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{url}</p>
            </div>
            {isActive ? (
              <StatusBadge>connected</StatusBadge>
            ) : (
              <StatusBadge>disabled</StatusBadge>
            )}
          </li>
        );
      })}
      {/* {CHAT_CHANNELS.map((channel) => {
        const isConnected = channel.status === "connected";

        return (
          <li key={channel.id} className="flex items-center gap-3 py-4 px-5">
            <img
              src={channelIcons[channel.id]}
              alt={channel.name}
              className="size-10 bg-primary/5 dark:bg-primary/20 rounded-xl p-2 object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {channel.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {channel.account}
              </p>
            </div>
            {isConnected ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" /> Connected
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                Check connection
              </span>
            )}
          </li>
        );
      })} */}
    </ul>

    <div className="border-t border-border p-4">
      <Link to={`/chatbot/${chatbotSlug}/configuration?tab=channels`}>
        <Button variant="outline" size="" className="w-full">
          Manage channels
        </Button>
      </Link>
    </div>
  </Card>
);

export default ConnectedChannels;
