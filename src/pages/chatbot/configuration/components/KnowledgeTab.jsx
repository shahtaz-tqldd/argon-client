import { useMemo, useState } from "react";
import {
  Database,
  FileText,
  Globe2,
  HardDrive,
  MessageSquareText,
  Plus,
  RefreshCw,
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
import {
  useDeleteKnowledgeMutation,
  useKnowledgeListQuery,
  useLazyKnowledgeDetailsQuery,
  useUpdateKnowledgeMutation,
  useUploadKnowledgeMutation,
} from "@/features/knowledge/knowledgeApiSlice";
import { formatDateTime } from "@/lib/date-time";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";

const SOURCE_TYPES = [
  { type: "file", label: "File", icon: FileText },
  { type: "url", label: "Website", icon: Globe2 },
  { type: "custom", label: "Text", icon: MessageSquareText },
];

const getResponseRecords = (response) => {
  const containers = [response, response?.data, response?.data?.data];

  for (const container of containers) {
    if (Array.isArray(container)) return container;

    for (const key of ["results", "items", "sources", "knowledge_bases"]) {
      if (Array.isArray(container?.[key])) return container[key];
    }
  }

  return [];
};

const getResponseMeta = (response) =>
  response?.meta ||
  response?.data?.meta ||
  response?.pagination ||
  response?.data?.pagination ||
  {};

const getResponseDetails = (response) => {
  const data = response?.data ?? response;
  return data?.data && !Array.isArray(data.data) ? data.data : data;
};

const firstDefined = (object, keys) => {
  for (const key of keys) {
    if (object?.[key] !== undefined && object[key] !== null) {
      return object[key];
    }
  }

  return undefined;
};

const finiteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizeType = (value) => {
  const type = String(value || "").toLowerCase();
  if (type.includes("file") || type.includes("document")) return "file";
  if (type.includes("url") || type.includes("web")) return "url";
  return "custom";
};

const typeLabel = (type) =>
  ({ file: "File", url: "Website", custom: "Text" })[type] || "Text";

const normalizeStatus = (value) => {
  const status = String(value || "processing").toLowerCase();

  if (["ready", "trained", "completed", "complete", "success"].includes(status)) {
    return "Ready";
  }
  if (["failed", "failure", "error"].includes(status)) return "Failed";
  if (
    [
      "processing",
      "pending",
      "queued",
      "training",
      "in_progress",
      "in-progress",
    ].includes(status)
  ) {
    return "Processing";
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const fileNameFromPath = (path) => {
  if (typeof path !== "string") return "";
  const segment = path.split("?")[0].split("/").filter(Boolean).at(-1);

  try {
    return decodeURIComponent(segment || "");
  } catch {
    return segment || "";
  }
};

const formatBytes = (value) => {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "string" && !/^\d+(\.\d+)?$/.test(value)) return value;

  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const amount = bytes / 1024 ** unitIndex;

  return `${amount >= 10 || unitIndex === 0 ? amount.toFixed(0) : amount.toFixed(1)} ${units[unitIndex]}`;
};

const parseBytes = (value) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/i);
  if (!match) return 0;

  const multipliers = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
  return Number(match[1]) * multipliers[(match[2] || "B").toUpperCase()];
};

const normalizeSource = (source) => {
  const apiType = normalizeType(
    firstDefined(source, ["type", "source_type", "knowledge_type", "content_type"]),
  );
  const fileValue = firstDefined(source, ["file_name", "filename", "original_filename"]);
  const filePath = typeof source.file === "string" ? source.file : source.file?.name;
  const fileName = fileValue || fileNameFromPath(filePath);
  const url = firstDefined(source, ["url", "source_url"]);
  const content = firstDefined(source, ["content", "text"]);
  const title = firstDefined(source, ["title", "name"]);
  const rawChunks = firstDefined(source, [
    "chunk_count",
    "chunks_count",
    "number_of_chunks",
    "chunks",
    "vector_count",
  ]);
  const chunks = Array.isArray(rawChunks) ? rawChunks.length : Number(rawChunks || 0);
  const rawSize = firstDefined(source, [
    "file_size_display",
    "size_display",
    "file_size",
    "size",
  ]);
  const fallbackTitle =
    fileName ||
    (apiType === "url"
      ? url
      : apiType === "file"
        ? "Uploaded file"
        : "Custom knowledge") ||
    "Untitled knowledge";
  const detail =
    apiType === "url"
      ? url
      : apiType === "file"
        ? fileName || "Uploaded file"
        : content || "Custom text content";

  return {
    id: firstDefined(source, ["id", "knowledge_base_id", "uuid"]),
    name: title || fallbackTitle,
    detail: String(detail || typeLabel(apiType)),
    apiType,
    type: typeLabel(apiType),
    size: formatBytes(rawSize),
    sizeBytes: parseBytes(rawSize),
    chunks: Number.isFinite(chunks) ? chunks : 0,
    status: normalizeStatus(
      firstDefined(source, ["status", "training_status", "processing_status"]),
    ),
    updated: formatDateTime(
      firstDefined(source, ["updated_at", "last_trained_at", "created_at"]),
    ),
    raw: source,
  };
};

function SummaryCard({ icon, label, value, detail, tone = "text-primary" }) {
  const SummaryIcon = icon;

  return (
    <Card className="p-5">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl bg-current/10",
          tone,
        )}
      >
        <SummaryIcon className="size-4" />
      </span>
      <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
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

function AddKnowledgeDialog({ open, onClose, onAdd, isLoading }) {
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
                    onClick={() => {
                      setSourceType(type);
                      setContent("");
                      setFile(null);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-xs font-semibold transition",
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
                <span className="mt-2 text-sm font-semibold">Choose a file</span>
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
            <Button type="button" variant="outline" onClick={close} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (sourceType === "file" ? !file : !content.trim())}
            >
              {isLoading ? <RefreshCw className="animate-spin" /> : <Plus />}
              {isLoading ? "Adding…" : "Add source"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UpdateCustomDialog({ source, onClose, onSave, isLoading }) {
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
            <DialogTitle>Update custom knowledge</DialogTitle>
            <DialogDescription>
              Replace the content for {source.name}. Existing vectors stay active
              until the replacement training finishes.
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !content.trim()}>
              <RefreshCw className={cn(isLoading && "animate-spin")} />
              {isLoading ? "Retraining…" : "Replace and retrain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const KnowledgeTab = ({ chatbotSlug, chatbotName }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useKnowledgeListQuery(
    { chatbotSlug, page, pageSize },
    { skip: !chatbotSlug },
  );
  const [uploadKnowledge, { isLoading: isUploading }] =
    useUploadKnowledgeMutation();
  const [getKnowledgeDetails, { isFetching: isLoadingDetails }] =
    useLazyKnowledgeDetailsQuery();
  const [updateKnowledge, { isLoading: isUpdating }] =
    useUpdateKnowledgeMutation();
  const [deleteKnowledge, { isLoading: isDeleting }] =
    useDeleteKnowledgeMutation();

  const sources = useMemo(
    () => getResponseRecords(data).map(normalizeSource).filter((source) => source.id),
    [data],
  );
  const visibleSources = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sources;

    return sources.filter((source) =>
      `${source.name} ${source.type} ${source.detail} ${source.status}`
        .toLowerCase()
        .includes(query),
    );
  }, [search, sources]);
  const meta = getResponseMeta(data);
  const totalSources = finiteNumber(
    firstDefined(meta, ["count", "total", "total_count", "total_items"]) ??
      sources.length,
    sources.length,
  );
  const pageChunks = sources.reduce((total, source) => total + source.chunks, 0);
  const pageStorage = sources.reduce((total, source) => total + source.sizeBytes, 0);
  const totalChunks = finiteNumber(
    firstDefined(meta, ["total_chunks", "chunk_count", "chunks"]),
    pageChunks,
  );
  const reportedStorage = firstDefined(meta, [
    "storage_bytes",
    "total_storage",
    "total_size",
  ]);
  const totalStorage =
    reportedStorage === undefined ? pageStorage : parseBytes(reportedStorage);
  const isPageSummary = totalSources > sources.length;

  const addSource = async ({ sourceType, title, content, file }) => {
    let payload;

    if (sourceType === "file") {
      payload = new FormData();
      payload.append("file", file);
      if (title.trim()) payload.append("title", title.trim());
    } else {
      payload = {
        ...(sourceType === "url"
          ? { url: content.trim() }
          : { content: content.trim() }),
        ...(title.trim() ? { title: title.trim() } : {}),
      };
    }

    try {
      const response = await uploadKnowledge({
        chatbotSlug,
        type: sourceType,
        payload,
      }).unwrap();
      toast.success(response?.message || "Knowledge source added and training started");
      return true;
    } catch (uploadError) {
      toast.error(
        getApiErrorMessage(uploadError, "Unable to add the knowledge source."),
      );
      return false;
    }
  };

  const reprocess = async (_, row) => {
    const source = row.raw;

    if (source.apiType === "custom") {
      try {
        const response = await getKnowledgeDetails({
          knowledgeBaseId: source.id,
        }).unwrap();
        const details = getResponseDetails(response);
        setEditingSource({
          ...source,
          content: firstDefined(details, ["content", "text"]) || source.raw.content || "",
        });
      } catch (detailsError) {
        toast.error(
          getApiErrorMessage(detailsError, "Unable to load the source content."),
        );
      }
      return;
    }

    try {
      const response = await updateKnowledge({
        chatbotSlug,
        knowledgeBaseId: source.id,
        type: source.apiType,
      }).unwrap();
      toast.success(response?.message || "Knowledge source queued for retraining");
    } catch (updateError) {
      toast.error(
        getApiErrorMessage(updateError, "Unable to retrain the knowledge source."),
      );
    }
  };

  const updateCustomSource = async (content) => {
    try {
      const response = await updateKnowledge({
        chatbotSlug,
        knowledgeBaseId: editingSource.id,
        type: "custom",
        payload: { content },
      }).unwrap();
      toast.success(response?.message || "Replacement content queued for training");
      return true;
    } catch (updateError) {
      toast.error(
        getApiErrorMessage(updateError, "Unable to update the custom knowledge."),
      );
      return false;
    }
  };

  const removeSource = async (id) => {
    try {
      const response = await deleteKnowledge({
        chatbotSlug,
        knowledgeBaseId: id,
      }).unwrap();
      if (sources.length === 1 && page > 1) setPage((current) => current - 1);
      toast.success(response?.message || "Knowledge source deleted");
      return true;
    } catch (deleteError) {
      toast.error(
        getApiErrorMessage(deleteError, "Unable to delete the knowledge source."),
      );
      return false;
    }
  };

  const rows = visibleSources.map((source) => ({
    id: source.id,
    raw: source,
    source: (
      <div className="min-w-56 max-w-80">
        <p className="text-sm font-semibold text-foreground">{source.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground" title={source.detail}>
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

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <SummaryCard
          icon={Database}
          label="Indexed chunks"
          value={totalChunks.toLocaleString()}
          detail={isPageSummary ? "Across sources on this page" : "Across all knowledge sources"}
        />
        <SummaryCard
          icon={HardDrive}
          label="Storage indexed"
          value={formatBytes(totalStorage)}
          detail={isPageSummary ? "Across files on this page" : "Across all uploaded files"}
          tone="text-violet-500"
        />
      </div>
      <ReusableTable
        title="Knowledge sources"
        description={`${totalSources} source${totalSources === 1 ? "" : "s"}${chatbotName ? ` training ${chatbotName}` : ""}`}
        headerActions={
          <div className="flex items-center gap-2">
            <label className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 w-52 rounded-xl bg-slate-50 pl-9"
                placeholder="Search this page"
              />
            </label>
            {isError && (
              <Button size="sm" variant="outline" onClick={refetch}>
                <RefreshCw />
                Retry
              </Button>
            )}
            <Button size="sm" onClick={() => setAddOpen(true)} disabled={!chatbotSlug}>
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
        isLoading={isLoading || isFetching}
        totalItems={search ? rows.length : totalSources}
        page={search ? 1 : page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        table_options={[
          {
            label: "Retry training",
            hidden: (row) =>
              row.raw.apiType !== "file" || row.raw.status !== "Failed",
            disabled: () => isUpdating || isLoadingDetails,
            action: reprocess,
          },
          {
            label: "Retrain source",
            hidden: (row) => row.raw.apiType === "file",
            disabled: () => isUpdating || isLoadingDetails,
            action: reprocess,
          },
          { label: "Delete source", type: "delete" },
        ]}
        onDeleteConfirm={removeSource}
        deleteLoading={isDeleting}
        emptyTitle={isError ? "Unable to load knowledge sources" : "No knowledge sources"}
        emptyDescription={
          isError
            ? getApiErrorMessage(error, "Please try again later.")
            : search
              ? "No sources on this page match your search."
              : "Add a file, website, or text content to start training Argon."
        }
      />
      <AddKnowledgeDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addSource}
        isLoading={isUploading}
      />
      {editingSource && (
        <UpdateCustomDialog
          key={editingSource.id}
          source={editingSource}
          onClose={() => setEditingSource(null)}
          onSave={updateCustomSource}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default KnowledgeTab;
