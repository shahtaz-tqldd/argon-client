import {
  ArrowDownLeft,
  ArrowDownRight,
  Check,
  ImagePlus,
  Monitor,
  Moon,
  Palette,
  Sun,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FloatingInput, Input } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { SectionCard, ToggleControl } from "../components/shared";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const POSITION_OPTIONS = [
  { value: "bottom_left", label: "Bottom left", icon: ArrowDownLeft },
  { value: "bottom_right", label: "Bottom right", icon: ArrowDownRight },
];

const ButtonSelector = ({ label, value, options, onChange, disabled }) => (
  <fieldset>
    <legend className="mb-2 text-xs font-semibold text-muted-foreground">
      {label}
    </legend>
    <div
      className={cn(
        "grid gap-2",
        options.length === 3 ? "grid-cols-3" : "grid-cols-2",
      )}
    >
      {options.map((option) => {
        const OptionIcon = option.icon;
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={selected}
            className={cn(
              "flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
              selected
                ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/10"
                : "bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/30 hover:text-foreground",
            )}
          >
            <OptionIcon className="size-4" />
            {option.label}
          </button>
        );
      })}
    </div>
  </fieldset>
);

const ColorField = ({ label, value, onChange, disabled }) => {
  const pickerValue = /^#[0-9a-fA-F]{6}/.test(value)
    ? value.slice(0, 7)
    : "#000000";

  return (
    <label className="flex items-center gap-3 rounded-2xl border p-3">
      <input
        type="color"
        value={pickerValue}
        onChange={(event) => onChange(event.target.value)}
        className="
    size-9 shrink-0 cursor-pointer
    overflow-hidden rounded-lg border-0 bg-transparent p-0
    disabled:cursor-not-allowed

    [&::-webkit-color-swatch-wrapper]:p-0
    [&::-webkit-color-swatch]:rounded-lg
    [&::-webkit-color-swatch]:border-0

    [&::-moz-color-swatch]:rounded-lg
    [&::-moz-color-swatch]:border-0
  "
        disabled={disabled}
        aria-label={label}
      />
      <span className="min-w-0 flex-1">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-0.5 h-auto border-0 p-0 text-sm font-semibold uppercase shadow-none focus-visible:ring-0"
          maxLength={9}
          disabled={disabled}
          aria-label={`${label} hex value`}
        />
      </span>
    </label>
  );
};

const WidgetLogoField = ({ identity, setIdentity, disabled }) => {
  const selectLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);

    setIdentity((current) => {
      if (current.logo.startsWith("blob:")) URL.revokeObjectURL(current.logo);

      return {
        ...current,
        logo: previewUrl,
        logoFile: file,
        clearLogo: false,
      };
    });
  };

  const removeLogo = () => {
    setIdentity((current) => {
      if (current.logo.startsWith("blob:")) URL.revokeObjectURL(current.logo);

      return {
        ...current,
        logo: "",
        logoFile: null,
        clearLogo: true,
      };
    });
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed p-4">
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
          {identity.logo ? (
            <img
              src={identity.logo}
              alt="Widget logo preview"
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">
            {identity.logo ? "Change widget logo" : "Upload widget logo"}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            PNG, JPG or WebP · max 2 MB
          </span>
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={selectLogo}
          disabled={disabled}
        />
      </label>
      {identity.logo && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={removeLogo}
          disabled={disabled}
          className="text-red-600 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove widget logo"
        >
          <Trash2 />
        </Button>
      )}
    </div>
  );
};

const WidgetAppearanceForm = ({
  settings,
  setSettings,
  identity,
  setIdentity,
  onSave,
  isSaving,
}) => {
  const update = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={submit}>
      <SectionCard
        icon={Palette}
        title="Settings & appearance"
        description="Control availability, colors, messages, placement, and branding."
      >
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Widget identity
            </p>
            <div className="space-y-5">
              <WidgetLogoField
                identity={identity}
                setIdentity={setIdentity}
                disabled={isSaving}
              />
              <FloatingInput
                name="widget-welcome-message"
                label="Welcome message"
                value={identity.welcomeMessage}
                onChange={(event) =>
                  setIdentity((current) => ({
                    ...current,
                    welcomeMessage: event.target.value,
                  }))
                }
                rows={4}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="border-t" />

          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField
              label="Primary color"
              value={settings.primaryColor}
              onChange={(value) => update("primaryColor", value)}
              disabled={isSaving}
            />
            <ColorField
              label="Text Color"
              value={settings.secondaryColor}
              onChange={(value) => update("secondaryColor", value)}
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ButtonSelector
              label="Theme"
              value={settings.theme}
              options={THEME_OPTIONS}
              onChange={(value) => update("theme", value)}
              disabled={isSaving}
            />
            <ButtonSelector
              label="Launcher position"
              value={settings.launcherPosition}
              options={POSITION_OPTIONS}
              onChange={(value) => update("launcherPosition", value)}
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FloatingInput
              name="widget-launcher-text"
              label="Launcher text"
              value={settings.launcherText}
              onChange={(event) => update("launcherText", event.target.value)}
              maxLength={100}
              disabled={isSaving}
            />
            <FloatingInput
              name="widget-header-title"
              label="Header title"
              value={settings.headerTitle}
              onChange={(event) => update("headerTitle", event.target.value)}
              maxLength={60}
              disabled={isSaving}
            />
          </div>
          <FloatingInput
            name="widget-header-description"
            label="Header description"
            value={settings.headerDescription}
            onChange={(event) =>
              update("headerDescription", event.target.value)
            }
            maxLength={100}
            disabled={isSaving}
          />

          <div className="flbx gap-5 rounded-2xl border border-slate-200 bg-slate-100 p-4">
            <div>
              <p className="text-sm font-semibold">Show Argon branding</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Display “Powered by <b>Argon Chatbot</b>” below the message input.
              </p>
            </div>
            <ToggleControl
              checked={settings.showBranding}
              onChange={(value) => update("showBranding", value)}
              disabled={isSaving}
              label="Show Argon branding"
            />
          </div>

          <div className="flex justify-end border-t pt-5">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <span className="spinner spinner-white" />
              ) : (
                <Check />
              )}
              {isSaving ? "Saving…" : "Save appearance"}
            </Button>
          </div>
        </div>
      </SectionCard>
    </form>
  );
};

export default WidgetAppearanceForm;
