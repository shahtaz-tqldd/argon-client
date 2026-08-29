import React, { useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import Card from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section";
import { Network as Hub } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import ContentDialog from "@/components/dialog/content-dialog";

const HubspotConfig = () => {
  const [hubspotOpen, setHubspotOpen] = useState(false);
  const [hubspot, setHubspot] = useState({
    connected: false,
    portal: "Atlas Workspace",
    sync: "Argon to HubSpot",
    pipeline: "Sales Pipeline",
    createContact: true,
    createDeal: true,
    syncConversation: true,
    lastSync: "Never",
  });
  return (
    <>
      <Card className="p-0">
        <div className="p-5 border-b flbx">
          <SectionTitle
            title="HubSpot integration"
            details="Sync captured and qualified leads with your CRM."
          />
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4 rounded-2xl border border-orange-500/15 bg-orange-500/[0.04] p-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
              <Hub className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {hubspot.connected
                  ? hubspot.portal
                  : "Connect your HubSpot portal"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {hubspot.connected
                  ? `Last synced ${hubspot.lastSync}`
                  : "Contacts, deals, fields, and summaries"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setHubspotOpen(true)}
            variant={hubspot.connected ? "outline" : "default"}
            className={cn(
              "mt-4 w-full",
              !hubspot.connected && "bg-orange-500 hover:bg-orange-600",
            )}
          >
            <Hub />
            {hubspot.connected ? "Manage connection" : "Connect HubSpot"}
          </Button>
        </div>
      </Card>
      <HubSpotDialog
        open={hubspotOpen}
        onClose={() => setHubspotOpen(false)}
        integration={hubspot}
        setIntegration={setHubspot}
      />
    </>
  );
};

function HubSpotDialog({ open, onClose, integration, setIntegration }) {
  const [draft, setDraft] = useState(integration);
  const save = () => {
    setIntegration({ ...draft, connected: true, lastSync: "Just now" });
    toast.success("HubSpot connected successfully");
    onClose();
  };
  return (
    <ContentDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={
        integration.connected ? "Manage HubSpot connection" : "Connect HubSpot"
      }
      description="Send qualified chatbot leads directly to your CRM without manual entry."
      footer={
        <div className="flx justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} className="bg-orange-500 hover:bg-orange-600">
            <Hub />
            {integration.connected ? "Save connection" : "Connect HubSpot"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 px-6 py-6">
        <FloatingInput
          name="hubspot-portal"
          label="HubSpot portal or account"
          value={draft.portal}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              portal: event.target.value,
            }))
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FloatingSelect
            label="Sync direction"
            value={draft.sync}
            displayValue={draft.sync}
            onValueChange={(value) =>
              setDraft((current) => ({ ...current, sync: value }))
            }
          >
            {["Argon to HubSpot", "Two-way sync"].map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </FloatingSelect>
          <FloatingSelect
            label="Deal pipeline"
            value={draft.pipeline}
            displayValue={draft.pipeline}
            onValueChange={(value) =>
              setDraft((current) => ({ ...current, pipeline: value }))
            }
          >
            {["Sales Pipeline", "Growth Pipeline", "Customer Success"].map(
              (item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ),
            )}
          </FloatingSelect>
        </div>
        {[
          [
            "createContact",
            "Create or update contacts",
            "Match existing contacts by email.",
          ],
          [
            "createDeal",
            "Create deals for qualified leads",
            "Create a deal when lead score reaches 70.",
          ],
          [
            "syncConversation",
            "Include conversation summary",
            "Attach the AI summary and session source.",
          ],
        ].map(([key, label, help]) => (
          <div
            key={key}
            className="flex items-start justify-between gap-5 rounded-2xl border p-4"
          >
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{help}</p>
            </div>
            <Toggle
              checked={draft[key]}
              onChange={(value) =>
                setDraft((current) => ({ ...current, [key]: value }))
              }
              label={`${draft[key] ? "Disable" : "Enable"} ${label}`}
            />
          </div>
        ))}
      </div>
    </ContentDialog>
  );
}

export default HubspotConfig;
