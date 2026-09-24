import { useState } from "react";

import {
  Ban,
  Download,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/dialog/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useBlockVisitorMutation,
  useLazyDownloadTranscriptQuery,
} from "@/features/chat/chatApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";

const TRANSCRIPT_FORMATS = [
  {
    value: "csv",
    label: "CSV",
    description: "Best for spreadsheets and data analysis",
    icon: FileSpreadsheet,
  },
  {
    value: "pdf",
    label: "PDF",
    description: "Best for reading, sharing, and printing",
    icon: FileText,
  },
];

const SessionDropdown = ({
  chatbotSlug,
  sessionId,
  setDeleteDialogOpen,
  setForceReturnDialogOpen,
  showForceReturnToAI = false,
  canForceReturnToAI = false,
  isOwnershipUpdating = false,
  isDeleting,
  onDelete,
}) => {
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [transcriptDialogOpen, setTranscriptDialogOpen] = useState(false);
  const [transcriptFormat, setTranscriptFormat] = useState("csv");
  const [blockVisitor, blockState] = useBlockVisitorMutation();
  const [downloadTranscript, downloadState] =
    useLazyDownloadTranscriptQuery();
  const canRunSessionAction = Boolean(chatbotSlug && sessionId);

  const handleBlockVisitor = async () => {
    if (!canRunSessionAction || blockState.isLoading) return;

    try {
      const response = await blockVisitor({ chatbotSlug, sessionId }).unwrap();
      setBlockDialogOpen(false);
      toast.success(response?.message || "Visitor blocked successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to block this visitor."));
    }
  };

  const handleDownloadTranscript = async () => {
    if (!canRunSessionAction || downloadState.isLoading) return;

    try {
      const response = await downloadTranscript({
        chatbotSlug,
        sessionId,
        format: transcriptFormat,
      }).unwrap();
      const file =
        response instanceof Blob
          ? response
          : response?.data instanceof Blob
            ? response.data
            : null;

      if (!file) throw new Error("The transcript response was not a file.");

      const objectUrl = URL.createObjectURL(file);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = `conversation-${sessionId}-transcript.${transcriptFormat}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);

      setTranscriptDialogOpen(false);
      toast.success("Transcript download started.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to download this transcript."),
      );
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="More actions">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={!canRunSessionAction || downloadState.isLoading}
            onSelect={() => setTranscriptDialogOpen(true)}
          >
            <Download />
            Download transcript
          </DropdownMenuItem>
          {showForceReturnToAI && (
            <DropdownMenuItem
              disabled={!canForceReturnToAI || isOwnershipUpdating}
              onSelect={() => setForceReturnDialogOpen(true)}
            >
              <Sparkles />
              Force return to AI
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={!canRunSessionAction || blockState.isLoading}
            onSelect={() => setBlockDialogOpen(true)}
          >
            <Ban />
            Block visitor
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={!onDelete || isDeleting}
            onSelect={() => setDeleteDialogOpen(true)}
          >
            <Trash2 />
            Delete Chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={blockDialogOpen}
        setOpen={setBlockDialogOpen}
        title="Block this visitor?"
        description="This visitor will no longer be able to send messages to this chatbot. The visitor is identified using a cookie stored in their browser."
        confirmText="Block visitor"
        confirmVariant="destructive"
        onConfirm={handleBlockVisitor}
        isLoading={blockState.isLoading}
      >
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs leading-5 text-amber-800 dark:text-amber-300">
          If the visitor clears their cookies or uses another browser or device,
          they may be able to start a new conversation.
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={transcriptDialogOpen}
        setOpen={setTranscriptDialogOpen}
        title="Download transcript"
        description="Only the latest 350 messages in this conversation can be downloaded. Choose a file format."
        confirmText="Download transcript"
        onConfirm={handleDownloadTranscript}
        isLoading={downloadState.isLoading}
      >
        <div
          className="grid gap-3 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Transcript format"
        >
          {TRANSCRIPT_FORMATS.map((format) => {
            const FormatIcon = format.icon;
            const isSelected = transcriptFormat === format.value;

            return (
              <button
                key={format.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={downloadState.isLoading}
                onClick={() => setTranscriptFormat(format.value)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-60",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <FormatIcon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {format.label}
                  </span>
                  <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">
                    {format.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </ConfirmDialog>
    </>
  );
};

export default SessionDropdown;
