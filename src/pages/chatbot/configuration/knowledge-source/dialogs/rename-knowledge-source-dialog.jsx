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
import { FloatingInput } from "@/components/ui/input";

const RenameKnowledgeSourceDialog = ({
  source,
  onClose,
  onSave,
  isLoading,
}) => {
  const [name, setName] = useState(source.name || "");

  const submit = async (event) => {
    event.preventDefault();
    const saved = await onSave(name.trim());
    if (saved) onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && !isLoading && onClose()}>
      <DialogContent className="rounded-3xl p-0 sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader className="border-b bg-muted/30 px-6 py-6">
            <DialogTitle>Rename knowledge source</DialogTitle>
            <DialogDescription>
              Choose a clear name for this {source.type.toLowerCase()} source.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-6">
            <FloatingInput
              name="knowledge-source-name"
              label="Source name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoFocus
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
            <Button
              type="submit"
              disabled={
                isLoading || !name.trim() || name.trim() === source.name
              }
            >
              {isLoading && <RefreshCw className="animate-spin" />}
              {isLoading ? "Saving…" : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameKnowledgeSourceDialog;
