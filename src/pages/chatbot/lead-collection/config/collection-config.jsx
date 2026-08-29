import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section";
import { FloatingTextarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

const CollectionConfig = ({
  settings,
  setSettings,
  isEnabled,
  onEnabledChange,
  hasChanges,
  isUpdating,
  onSave,
}) => (
  <Card className="p-0">
    <div className="border-b p-5">
      <SectionTitle
        title="Collection behavior"
        details="Control when collection starts and what visitors see."
      />
    </div>

    <div className="space-y-5 p-5">
      <div
        className={cn(
          "flbx gap-3 rounded-2xl border p-4",
          isEnabled
            ? "border-emerald-500/15 bg-emerald-500/[0.05]"
            : "bg-muted/30",
        )}
      >
        <div className="flx gap-3">
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-full",
              isEnabled
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Check className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">
              Lead collection is {isEnabled ? "enabled" : "disabled"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isEnabled
                ? "Visible fields can be requested during a conversation."
                : "Your field setup is saved, but visitors won't be asked for it."}
            </p>
          </div>
        </div>

        <Toggle
          checked={isEnabled}
          onChange={onEnabledChange}
          disabled={isUpdating}
          label={`${isEnabled ? "Disable" : "Enable"} lead collection`}
        />
      </div>

      <div className="divide-y rounded-2xl border">
        <div className="flbx gap-5 p-4">
          <div>
            <p className="text-sm font-semibold">Collect automatically</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Collect lead information before the chat session starts.
            </p>
          </div>
          <Toggle
            checked={settings.auto_collect}
            onChange={(autoCollect) =>
              setSettings((current) => ({
                ...current,
                auto_collect: autoCollect,
              }))
            }
            disabled={isUpdating}
            label={`${settings.auto_collect ? "Disable" : "Enable"} automatic lead collection`}
          />
        </div>

        <div className="flbx gap-5 p-4">
          <div>
            <p className="text-sm font-semibold">Require consent</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ask visitors to agree before their information is collected.
            </p>
          </div>
          <Toggle
            checked={settings.require_consent}
            onChange={(requireConsent) =>
              setSettings((current) => ({
                ...current,
                require_consent: requireConsent,
                consent_message: requireConsent
                  ? current.consent_message
                  : "",
              }))
            }
            disabled={isUpdating}
            label={`${settings.require_consent ? "Disable" : "Enable"} consent requirement`}
          />
        </div>
      </div>

      <div className="grid gap-4">
        <FloatingTextarea
          name="lead-intro-message"
          label="Intro message (optional)"
          value={settings.intro_message}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              intro_message: event.target.value,
            }))
          }
          disabled={isUpdating}
          rows={2}
          textareaClassName="min-h-12"
        />

        {settings.require_consent && (
          <FloatingTextarea
            name="lead-consent-message"
            label="Consent message"
            value={settings.consent_message}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                consent_message: event.target.value,
              }))
            }
            disabled={isUpdating}
            rows={2}
            textareaClassName="min-h-12"
          />
        )}
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button onClick={onSave} disabled={!hasChanges || isUpdating}>
          {isUpdating ? (
            <span className="spinner spinner-white" />
          ) : (
            <Check />
          )}
          Save behavior
        </Button>
      </div>
    </div>
  </Card>
);

export default CollectionConfig;
