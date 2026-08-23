import { useMemo, useState } from "react";
import {
  Database,
  FileText,
  Globe2,
  MessageSquareText,
  Plus,
  Search,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput, Input } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function UsageCard({
  icon,
  label,
  current,
  total,
  display,
  tone = "bg-primary",
}) {
  const UsageIcon = icon;
  const percent = Math.min(100, Math.round((current / total) * 100));

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UsageIcon className="size-4" />
        </span>
        <span className="text-xs font-bold">{percent}%</span>
      </div>
      <p className="mt-4 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{display}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", tone)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </Card>
  );
}

function SourceStatus({ status }) {
  const processing = status === "Processing";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        processing
          ? "bg-amber-500/10 text-amber-600"
          : status === "Failed"
            ? "bg-red-500/10 text-red-600"
            : "bg-emerald-500/10 text-emerald-600",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full bg-current",
          processing && "animate-pulse",
        )}
      />
      {status}
    </span>
  );
}

function AddKnowledgeDialog({ open, onClose, onAdd }) {
  const [sourceType, setSourceType] = useState("Website");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const submit = (event) => {
    event.preventDefault();
    onAdd({
      sourceType,
      name:
        name ||
        (sourceType === "File" ? "Uploaded document" : "New knowledge source"),
      content,
    });
    setName("");
    setContent("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
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
              {[
                { type: "File", icon: FileText },
                { type: "Website", icon: Globe2 },
                { type: "Text", icon: MessageSquareText },
              ].map(({ type, icon }) => {
                const TypeIcon = icon;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSourceType(type)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-xs font-semibold transition",
                      sourceType === type
                        ? "border-primary bg-primary/5 text-primary"
                        : "hover:bg-muted",
                    )}
                  >
                    <TypeIcon className="size-5" />
                    {type}
                  </button>
                );
              })}
            </div>
            <FloatingInput
              name="source-name"
              label="Source name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {sourceType === "File" ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center transition hover:border-primary hover:bg-primary/[0.03]">
                <UploadCloud className="size-6 text-primary" />
                <span className="mt-2 text-sm font-semibold">Choose a file</span>
                <span className="mt-1 text-xs text-muted-foreground">
                  PDF, DOCX, TXT, CSV · max 20 MB
                </span>
                <input
                  type="file"
                  className="sr-only"
                  onChange={(event) =>
                    setContent(event.target.files?.[0]?.name || "")
                  }
                />
                {content && (
                  <span className="mt-3 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {content}
                  </span>
                )}
              </label>
            ) : sourceType === "Website" ? (
              <FloatingInput
                name="website-url"
                label="Website URL"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="https://"
              />
            ) : (
              <FloatingTextarea
                name="knowledge-content"
                label="Text or content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={6}
              />
            )}
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus />
              Add source
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const KnowledgeTab = ({ sources, setSources }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const visibleSources = useMemo(
    () =>
      sources.filter((source) =>
        `${source.name} ${source.type}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [sources, search],
  );

  const reprocess = (_, row) => {
    setSources((current) =>
      current.map((source) =>
        source.id === row.id
          ? { ...source, status: "Processing", updated: "Just now" }
          : source,
      ),
    );
    toast.success(`${row.name} queued for reprocessing`);
  };

  const rows = visibleSources.map((source) => ({
    ...source,
    source: (
      <div className="min-w-56">
        <p className="text-sm font-semibold text-foreground">{source.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {source.detail}
        </p>
      </div>
    ),
    sourceType: (
      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
        {source.type}
      </span>
    ),
    chunkCount: (
      <span className="text-xs font-semibold text-foreground">
        {source.chunks.toLocaleString()}
      </span>
    ),
    sourceStatus: <SourceStatus status={source.status} />,
    action: "",
  }));

  const addSource = ({ sourceType, name, content }) => {
    setSources((current) => [
      ...current,
      {
        id: `source-${Date.now()}`,
        name,
        detail: content || `${sourceType} source`,
        type: sourceType,
        size: sourceType === "File" ? "1.2 MB" : "—",
        chunks: 0,
        status: "Processing",
        updated: "Just now",
      },
    ]);
    toast.success("Knowledge source added and processing started");
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <UsageCard
          icon={Database}
          label="Chunk usage"
          current={1246}
          total={2500}
          display="1,246 of 2,500 chunks"
        />
        <UsageCard
          icon={FileText}
          label="Storage usage"
          current={13.7}
          total={50}
          display="13.7 MB of 50 MB"
          tone="bg-violet-500"
        />
      </div>
      <ReusableTable
        title="Knowledge sources"
        description={`${sources.length} sources training Atlas Support`}
        headerActions={
          <div className="flex items-center gap-2">
            <label className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 w-52 rounded-xl bg-slate-50 pl-9"
                placeholder="Search sources"
              />
            </label>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus />
              Add knowledge
            </Button>
          </div>
        }
        data={rows}
        columns={[
          { header: "Name", accessorKey: "source" },
          { header: "Type", accessorKey: "sourceType" },
          { header: "Size", accessorKey: "size" },
          { header: "Chunks", accessorKey: "chunkCount" },
          { header: "Status", accessorKey: "sourceStatus" },
          { header: "Last updated", accessorKey: "updated" },
          { header: "", accessorKey: "action" },
        ]}
        isLoading={false}
        totalItems={rows.length}
        page={1}
        setPage={() => {}}
        pageSize={10}
        setPageSize={() => {}}
        table_options={[
          { label: "Reprocess", action: reprocess },
          { label: "Delete source", type: "delete" },
        ]}
        onDeleteConfirm={async (id) => {
          setSources((current) => current.filter((source) => source.id !== id));
          toast.success("Knowledge source deleted");
        }}
        deleteLoading={false}
        emptyTitle="No knowledge sources"
        emptyDescription="Add a file, website, or text content to start training Argon."
      />
      <AddKnowledgeDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addSource}
      />
    </div>
  );
};

export default KnowledgeTab;
