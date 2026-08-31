import { Code2, Copy, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { ToggleControl } from "../components/shared";
import { SectionCard } from "@/components/ui/card";

const WIDGET_SCRIPT_URL = "https://cdn.argon.chat/widget.js";

const WidgetInstallation = ({
  publicKey,
  isEnabled,
  isSaving,
  onEnabledChange,
}) => {
  const installCode = `<script src="${WIDGET_SCRIPT_URL}" data-chatbot="${publicKey || "YOUR_PUBLIC_KEY"}" async></script>`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(installCode);
      toast.success("Installation code copied");
    } catch {
      toast.error("Unable to copy the installation code.");
    }
  };

  return (
    <SectionCard
      icon={Code2}
      title="Installation script"
      description="Add this script before the closing body tag on your website."
    >
      <div className="relative rounded-2xl bg-slate-100 border border-slate-200 p-4 pr-12 text-xs leading-6 text-slate-800">
        <code className="break-all">{installCode}</code>
        <Button
          onClick={copyCode}
          variant="ghost"
          size="icon-sm"
          className="absolute right-2 top-2 text-slate-400 hover:bg-primary hover:text-white"
          aria-label="Copy installation code"
          disabled={!publicKey}
        >
          <Copy />
        </Button>
      </div>
      <div className="flx gap-2 mt-5">
        <p className="text-sm font-semibold">Enable widget</p>
        <ToggleControl
          checked={isEnabled}
          onChange={onEnabledChange}
          disabled={isSaving}
          label="Enable widget"
        />
      </div>
      {!isEnabled ? (
        <div className="mt-3 flx gap-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
          <TriangleAlert className="size-3.5" />
          Your chatbot widget is disabled, your chatbot won't appear on the
          website
        </div>
      ) : null}
    </SectionCard>
  );
};

export default WidgetInstallation;
