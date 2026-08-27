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

import {
  SourceAvailability,
  SourceStatus,
} from "../knowledge-source-badges";
import { finiteNumber, normalizeStatus } from "../knowledge-source-utils";

function DetailField({ label, value }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 break-words text-sm font-medium text-foreground">
        {value || "—"}
      </div>
    </div>
  );
}

const KnowledgeSourceDetailsDialog = ({ source, onClose, isLoading }) => {
  if (!source) return null;

  const training = source.latestTraining;

  return (
    <Dialog open onOpenChange={(next) => !next && !isLoading && onClose()}>
      <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-muted/30 px-6 py-6">
          <DialogTitle>{source.name}</DialogTitle>
          <DialogDescription>
            Source details, processing information, and training status.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 px-6 py-6">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="size-4 animate-spin" />
              Loading source details…
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailField label="Type" value={source.type} />
                <DetailField
                  label="Availability"
                  value={<SourceAvailability isEnabled={source.isEnabled} />}
                />
                <DetailField
                  label="Status"
                  value={<SourceStatus status={source.status} />}
                />
                <DetailField label="Size" value={source.size} />
                <DetailField label="Processed" value={source.processed} />
                <DetailField label="Last updated" value={source.updated} />
                {source.apiType === "url" && (
                  <DetailField
                    label="Last crawled"
                    value={source.lastCrawled}
                  />
                )}
                <DetailField label="Created" value={source.created} />
              </div>

              {source.apiType === "url" && source.url && (
                <DetailField
                  label="Website URL"
                  value={
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {source.url}
                    </a>
                  }
                />
              )}

              {source.apiType === "file" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailField
                    label="Original filename"
                    value={source.originalFilename}
                  />
                  <DetailField
                    label="File type"
                    value={source.fileType || "—"}
                  />
                  {source.fileUrl && (
                    <div className="sm:col-span-2">
                      <DetailField
                        label="File"
                        value={
                          <a
                            href={source.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            Open uploaded file
                          </a>
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              {source.apiType === "custom" && (
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Text content
                  </p>
                  <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {source.content || "—"}
                  </p>
                </div>
              )}

              {training && (
                <div>
                  <p className="mb-3 text-sm font-semibold">Latest training</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <DetailField
                      label="Stage"
                      value={normalizeStatus(training.stage)}
                    />
                    <DetailField
                      label="Progress"
                      value={`${finiteNumber(training.progress)}%`}
                    />
                    <DetailField
                      label="Chunks"
                      value={finiteNumber(training.total_chunks).toLocaleString()}
                    />
                  </div>
                </div>
              )}

              {source.errorMessage && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-4 text-sm text-red-600">
                  {source.errorMessage}
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeSourceDetailsDialog;
