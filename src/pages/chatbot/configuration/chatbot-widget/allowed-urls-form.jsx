import { Check, Globe2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SectionCard, ToggleControl } from "../components/shared";

const createUrlRow = () => ({
  key: globalThis.crypto?.randomUUID?.() || `new-url-${Date.now()}`,
  url: "",
  isActive: true,
});

const AllowedUrlsForm = ({
  allowedUrls,
  setAllowedUrls,
  onSave,
  onRequestRemove,
  onRequestStatusChange,
  hasChanges,
  isSaving,
}) => {
  const updateUrl = (key, changes) => {
    setAllowedUrls((current) =>
      current.map((item) =>
        item.key === key ? { ...item, ...changes } : item,
      ),
    );
  };

  const submit = (event) => {
    event.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={submit}>
      <SectionCard
        icon={Globe2}
        title="Allowed URLs"
        description="Choose the website origins where this widget is permitted to load."
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-4 text-xs leading-5 text-muted-foreground">
            Enter origins only, such as <strong>https://example.com</strong>.
            Paths, query parameters, and fragments are not supported.
          </div>

          {allowedUrls.length ? (
            <div className="space-y-3">
              {allowedUrls.map((item, index) => (
                <div
                  key={item.key}
                  className="flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={`allowed-url-${item.key}`}
                      className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
                    >
                      Origin {index + 1}
                    </label>
                    <Input
                      id={`allowed-url-${item.key}`}
                      value={item.url}
                      onChange={(event) =>
                        updateUrl(item.key, { url: event.target.value })
                      }
                      placeholder="https://example.com"
                      disabled={isSaving}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:pt-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                      <ToggleControl
                        checked={item.isActive}
                        onChange={() => onRequestStatusChange(item)}
                        disabled={isSaving}
                        label={`Change status for ${item.url || `origin ${index + 1}`}`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRequestRemove(item)}
                      disabled={isSaving}
                      className="text-red-600 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove origin ${index + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-muted/20 px-4 py-8 text-center">
              <p className="text-sm font-semibold">No allowed URLs yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add an origin to control where the widget can load.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setAllowedUrls((current) => [...current, createUrlRow()])
              }
              disabled={isSaving}
            >
              <Plus />
              Add origin
            </Button>
            {hasChanges && (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <span className="spinner spinner-white" />
                ) : (
                  <Check />
                )}
                {isSaving ? "Saving…" : "Save changes"}
              </Button>
            )}
          </div>
        </div>
      </SectionCard>
    </form>
  );
};

export default AllowedUrlsForm;
