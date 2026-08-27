import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const UpdateCustomKnowledgeDialog = ({
  source,
  onClose,
  onSave,
  isLoading,
}) => {
  const [content, setContent] = useState(source.content || "");

  const submit = async (event) => {
    event.preventDefault();
    const saved = await onSave(content.trim());
    if (saved) onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && !isLoading && onClose()}>
      <DialogContent className="rounded-3xl p-0 sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader className="border-b bg-muted/30 px-6 py-6">
            <DialogTitle>Update text content</DialogTitle>
            <DialogDescription>
              Replace the content for {source.name}. The source will be
              retrained after you save it.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-6">
            <FloatingTextarea
              name="replacement-content"
              label="Replacement content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              required
              disabled={isLoading}
            />
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !content.trim()}>
              <RefreshCw className={cn(isLoading && "animate-spin")} />
              {isLoading ? "Updating…" : "Update and retrain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCustomKnowledgeDialog;
