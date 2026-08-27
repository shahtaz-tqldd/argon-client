import { CheckCircle2, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

const channelIcons = {
  facebook: "/ms.webp",
  whatsapp: "/wp.webp",
  instagram: "/insta.webp",
};

const ConnectedChannels = ({ channels }) => (
  <section
    aria-labelledby="connected-channels-title"
    className="border-t border-border bg-card"
  >
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
        {channels.filter(({ status }) => status === "connected").length} live
      </span>
    </div>

    <ul className="divide-y divide-border px-5">
      {channels.map((channel) => {
        const isConnected = channel.status === "connected";

        return (
          <li key={channel.id} className="flex items-center gap-3 py-3.5">
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
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Manage ${channel.name}`}
            >
              <MoreHorizontal />
            </Button>
          </li>
        );
      })}
    </ul>

    <div className="border-t border-border p-4">
      <Button variant="outline" size="sm" className="w-full">
        Manage channels
      </Button>
    </div>
  </section>
);

export default ConnectedChannels;
