import { useState } from "react";
import {
  FileText,
  Globe2,
  MessageSquareText,
  Plus,
  RefreshCw,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const SOURCE_TYPES = [
  { type: "file", label: "File", icon: FileText },
  { type: "url", label: "Website", icon: Globe2 },
  { type: "custom", label: "Text", icon: MessageSquareText },
];

const UploadKnowledgeSourceDialog = ({ open, onClose, onAdd, isLoading }) => {
  const [sourceType, setSourceType] = useState("url");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  const close = () => {
    if (isLoading) return;
    setSourceType("url");
    setTitle("");
    setContent("");
    setFile(null);
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    const saved = await onAdd({ sourceType, title, content, file });
    if (saved) close();
  };

  const selectSourceType = (type) => {
    setSourceType(type);
    setContent("");
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="rounded-3xl p-0 sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader className="border-b bg-muted/30 px-6 py-6">
            <DialogTitle>Add knowledge</DialogTitle>
            <DialogDescription>
              Train Argon using a file, website, or your own text content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 px-6 py-6">
            <div className="grid grid-cols-3 gap-2">
              {SOURCE_TYPES.map(({ type, label, icon }) => {
                const TypeIcon = icon;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => selectSourceType(type)}
                    disabled={isLoading}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                      sourceType === type
                        ? "border-primary bg-primary/5 text-primary"
                        : "hover:bg-muted",
                    )}
                  >
                    <TypeIcon className="size-5" />
                    {label}
                  </button>
                );
              })}
            </div>
            <FloatingInput
              name="knowledge-title"
              label="Title (optional)"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isLoading}
            />
            {sourceType === "file" ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center transition hover:border-primary hover:bg-primary/[0.03]">
                <UploadCloud className="size-6 text-primary" />
                <span className="mt-2 text-sm font-semibold">
                  Choose a file
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  PDF, DOCX, TXT, or CSV
                </span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.txt,.csv"
                  required
                  disabled={isLoading}
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
                {file && (
                  <span className="mt-3 max-w-full truncate rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {file.name}
                  </span>
                )}
              </label>
            ) : sourceType === "url" ? (
              <FloatingInput
                name="knowledge-url"
                type="url"
                label="Website URL"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="https://example.com"
                required
                disabled={isLoading}
              />
            ) : (
              <FloatingTextarea
                name="knowledge-content"
                label="Text or content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={6}
                required
                disabled={isLoading}
              />
            )}
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || (sourceType === "file" ? !file : !content.trim())
              }
            >
              {isLoading ? <RefreshCw className="animate-spin" /> : <Plus />}
              {isLoading ? "Adding…" : "Add source"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadKnowledgeSourceDialog;
