import {
  Bot,
  Check,
  Code2,
  Copy,
  Globe2,
  MessageCircleMore,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { SectionCard, ToggleControl, ValueRow } from "./shared";

const installCode = `<script src="https://cdn.argon.chat/widget.js" data-chatbot="atlas-support" async></script>`;

function WidgetPreview({ appearance }) {
  const dark = appearance.theme === "Dark";

  return (
    <Card className="sticky top-0 p-0">
      <div className="border-b px-5 py-4">
        <p className="text-sm font-bold">Live preview</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Updates as you save appearance changes.
        </p>
      </div>
      <div className="relative h-[560px] overflow-hidden bg-slate-100 p-5 dark:bg-slate-900">
        <div className="space-y-3 opacity-60">
          <div className="h-7 w-28 rounded bg-slate-300 dark:bg-slate-700" />
          <div className="h-3 w-3/4 rounded bg-slate-300 dark:bg-slate-700" />
          <div className="h-3 w-1/2 rounded bg-slate-300 dark:bg-slate-700" />
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="h-24 rounded-xl bg-white dark:bg-slate-800" />
            <div className="h-24 rounded-xl bg-white dark:bg-slate-800" />
          </div>
        </div>
        <div
          className={cn(
            "absolute bottom-20 right-5 w-[285px] overflow-hidden rounded-2xl shadow-2xl",
            dark ? "bg-slate-900 text-white" : "bg-white text-slate-900",
          )}
        >
          <div
            className="p-4 text-white"
            style={{ backgroundColor: appearance.primaryColor }}
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white/20">
                {appearance.logo ? (
                  <img
                    src={appearance.logo}
                    alt="Widget logo"
                    className="size-full object-cover"
                  />
                ) : (
                  <Bot className="size-4" />
                )}
              </span>
              <div>
                <p className="text-sm font-bold">{appearance.headerTitle}</p>
                <p className="text-[10px] text-white/80">
                  Typically replies instantly
                </p>
              </div>
            </div>
          </div>
          <div className="h-64 p-4">
            <div
              className={cn(
                "max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-2.5 text-xs leading-5",
                dark ? "bg-slate-800" : "bg-slate-100",
              )}
            >
              {appearance.greeting}
            </div>
          </div>
          <div className="border-t p-3">
            <div
              className={cn(
                "flex items-center justify-between rounded-full px-3 py-2 text-[11px] text-slate-400",
                dark ? "bg-slate-800" : "bg-slate-100",
              )}
            >
              <span>Type your message…</span>
              <MessageCircleMore className="size-4" />
            </div>
            {appearance.showBranding && (
              <p className="mt-2 text-center text-[9px] text-slate-400">
                Powered by Argon
              </p>
            )}
          </div>
        </div>
        <button
          className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full px-4 py-3 text-xs font-bold text-white shadow-lg"
          style={{ backgroundColor: appearance.primaryColor }}
        >
          <MessageCircleMore className="size-4" />
          {appearance.launcherText}
        </button>
      </div>
    </Card>
  );
}

const WidgetTab = ({ config, edit }) => {
  const allowed = config.targeting.allowedUrls.split("\n").filter(Boolean);
  const disabled = config.targeting.disabledUrls.split("\n").filter(Boolean);

  const copyCode = async () => {
    await navigator.clipboard.writeText(installCode);
    toast.success("Installation code copied");
  };

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <SectionCard
          icon={Palette}
          title="Appearance"
          description="Colors, logo, messages, theme, and Argon branding."
          onEdit={() => edit("appearance")}
        >
          <div className="divide-y">
            <ValueRow label="Primary color">
              <span className="flex items-center gap-2 text-xs font-semibold">
                <span
                  className="size-4 rounded-full border"
                  style={{ backgroundColor: config.appearance.primaryColor }}
                />
                {config.appearance.primaryColor}
              </span>
            </ValueRow>
            <ValueRow
              label="Header title"
              value={config.appearance.headerTitle}
            />
            <ValueRow label="Theme" value={config.appearance.theme} />
            <ValueRow
              label="Show branding"
              value={config.appearance.showBranding ? "Yes" : "No"}
            />
          </div>
        </SectionCard>
        <SectionCard
          icon={Globe2}
          title="Allowed URLs"
          description="Choose where the widget can load and where it stays disabled."
          onEdit={() => edit("targeting")}
        >
          <div className="flex items-center justify-between rounded-xl bg-muted/35 p-3">
            <div>
              <p className="text-xs font-semibold">Enable by default</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Widget appears on matching pages
              </p>
            </div>
            <ToggleControl
              checked={config.targeting.enabledEverywhere}
              onChange={() => edit("targeting")}
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-3">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Allowed patterns
              </p>
              <p className="mt-2 text-2xl font-bold">{allowed.length}</p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Disabled patterns
              </p>
              <p className="mt-2 text-2xl font-bold">{disabled.length}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard
          icon={Code2}
          title="Installation"
          description="Add this script before the closing body tag on your website."
        >
          <div className="relative rounded-2xl bg-slate-950 p-4 pr-12 font-mono text-xs leading-6 text-slate-300">
            <code className="break-all">{installCode}</code>
            <Button
              onClick={copyCode}
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-2 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Copy installation code"
            >
              <Copy />
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
            <Check className="size-3.5" />
            Widget detected on atlas.co
          </div>
        </SectionCard>
      </div>
      <WidgetPreview appearance={config.appearance} />
    </div>
  );
};

export default WidgetTab;
