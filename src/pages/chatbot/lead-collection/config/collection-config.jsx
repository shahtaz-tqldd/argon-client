import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/card";
import { FloatingTextarea } from "@/components/ui/textarea";
import { FeatureToggle, Toggle } from "@/components/ui/toggle";

const CollectionConfig = ({
  settings,
  setSettings,
  isEnabled,
  onEnabledChange,
  hasChanges,
  isUpdating,
  onSave,
}) => (
  <SectionCard
    title="Collection behavior"
    description="Control when collection starts and what visitors see."
    childClassName="space-y-5"
  >
    <FeatureToggle
      enabled={isEnabled}
      setEnabled={onEnabledChange}
      disabled={isUpdating}
      activeTitle="Lead collection is enabled"
      inActiveTitle="Lead collection is disabled"
      activeText="Visible fields can be requested during a conversation."
      inActiveText="Your field setup is saved, but visitors won't be asked for it."
    />

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
              consent_message: requireConsent ? current.consent_message : "",
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
        {isUpdating ? <span className="spinner spinner-white" /> : <Check />}
        Save behavior
      </Button>
    </div>
  </SectionCard>
);

export default CollectionConfig;
