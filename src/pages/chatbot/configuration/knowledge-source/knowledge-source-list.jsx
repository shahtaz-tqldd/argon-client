import { useMemo, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";

import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import {
  SourceAvailability,
  SourceStatus,
} from "./knowledge-source-badges";

const COLUMNS = [
  { header: "Name", accessorKey: "source" },
  { header: "Type", accessorKey: "sourceType" },
  { header: "Size", accessorKey: "size" },
  { header: "Availability", accessorKey: "availability" },
  { header: "Status", accessorKey: "sourceStatus" },
  { header: "Last updated", accessorKey: "updated" },
  { header: "", accessorKey: "action" },
];

const KnowledgeSourceList = ({
  chatbotSlug,
  chatbotName,
  sources,
  totalSources,
  page,
  setPage,
  pageSize,
  setPageSize,
  isLoading,
  isError,
  error,
  onRetry,
  onAdd,
  onViewDetails,
  onRename,
  onChangeAvailability,
  onRetrain,
  onUpdateContent,
  onDelete,
  isLoadingDetails,
  isUpdating,
  isDeleting,
}) => {
  const [search, setSearch] = useState("");

  const visibleSources = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sources;

    return sources.filter((source) =>
      `${source.name} ${source.type} ${source.detail} ${source.status}`
        .toLowerCase()
        .includes(query),
    );
  }, [search, sources]);

  const rows = visibleSources.map((source) => ({
    id: source.id,
    raw: source,
    source: (
      <div className="min-w-56 max-w-80">
        <p className="text-sm font-semibold text-foreground">{source.name}</p>
        <p
          className="mt-0.5 truncate text-xs text-muted-foreground"
          title={source.detail}
        >
          {source.detail}
        </p>
      </div>
    ),
    sourceType: (
      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
        {source.type}
      </span>
    ),
    size: (
      <span className="text-xs font-medium text-foreground">{source.size}</span>
    ),
    availability: <SourceAvailability isEnabled={source.isEnabled} />,
    sourceStatus: <SourceStatus status={source.status} />,
    updated: (
      <span className="text-xs text-muted-foreground">{source.updated}</span>
    ),
    action: "",
  }));

  const tableOptions = [
    {
      label: "View details",
      disabled: () => isLoadingDetails,
      action: onViewDetails,
    },
    {
      label: "Rename",
      disabled: () => isUpdating,
      action: (_, row) => onRename(row.raw),
    },
    {
      label: "Enable",
      hidden: (row) => row.raw.isEnabled,
      disabled: () => isUpdating,
      action: (_, row) => onChangeAvailability(row.raw),
    },
    {
      label: "Disable",
      hidden: (row) => !row.raw.isEnabled,
      disabled: () => isUpdating,
      action: (_, row) => onChangeAvailability(row.raw),
    },
    {
      label: "Retrain website",
      hidden: (row) => row.raw.apiType !== "url",
      disabled: () => isUpdating || isLoadingDetails,
      action: (_, row) => onRetrain(row.raw),
    },
    {
      label: "Retry training",
      hidden: (row) =>
        row.raw.apiType !== "file" || row.raw.status !== "Failed",
      disabled: () => isUpdating || isLoadingDetails,
      action: (_, row) => onRetrain(row.raw),
    },
    {
      label: "Update content",
      hidden: (row) => row.raw.apiType !== "custom",
      disabled: () => isUpdating || isLoadingDetails,
      action: onUpdateContent,
    },
    { label: "Delete source", type: "delete" },
  ];

  return (
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
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw />
              Retry
            </Button>
          )}
          <Button size="sm" onClick={onAdd} disabled={!chatbotSlug}>
            <Plus />
            Add knowledge
          </Button>
        </div>
      }
      data={rows}
      columns={COLUMNS}
      isLoading={isLoading}
      totalItems={search ? rows.length : totalSources}
      page={search ? 1 : page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      table_options={tableOptions}
      onDeleteConfirm={onDelete}
      deleteLoading={isDeleting}
      deleteTitle="Delete knowledge source?"
      deleteDescription="This knowledge source and its indexed content will be permanently deleted. This action cannot be undone."
      deleteConfirmText="Delete source"
      emptyTitle={
        isError ? "Unable to load knowledge sources" : "No knowledge sources"
      }
      emptyDescription={
        isError
          ? getApiErrorMessage(error, "Please try again later.")
          : search
            ? "No sources on this page match your search."
            : "Add a file, website, or text content to start training Argon."
      }
    />
  );
};

export default KnowledgeSourceList;
