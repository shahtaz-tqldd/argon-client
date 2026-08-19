import { useMemo, useState } from "react";
import { Database, Sparkles } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/dialog/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Text, Title } from "@/components/ui/typography";
import {
  useAppConfigQuery,
  useUpdateAppConfigMutation,
} from "@/features/app-config/appConfigApiSlice";
import {
  useDeleteBulkRecordMutation,
  useDeleteRecordMutation,
  useRecordListQuery,
  useSearchRecordQuery,
} from "@/features/vector-store/vectorStoreApiSlice";

import VectorFilter from "./components/vector-filter";
import VectorTable from "./components/vector-table";

const getItems = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const getTotal = (response, fallback) =>
  response?.meta?.total ??
  response?.meta?.count ??
  response?.count ??
  response?.data?.count ??
  response?.data?.meta?.total ??
  fallback;

const errorMessage = (error, fallback) =>
  error?.data?.message ||
  error?.data?.detail ||
  error?.data?.error?.[0] ||
  fallback;

const VectorStorePage = () => {
  const {
    data: appConfig,
    isLoading: isConfigLoading,
    isFetching: isConfigFetching,
  } = useAppConfigQuery({ feature: true });
  const [updateAppConfig, { isLoading: isUpdatingConfig }] =
    useUpdateAppConfigMutation();
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [queryInput, setQueryInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceType, setSourceType] = useState("all");
  const [destinationId, setDestinationId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isVectorizationEnabled = Boolean(
    appConfig?.data?.feature?.is_vectorize_enabled,
  );
  const normalizedSourceType = sourceType === "all" ? "" : sourceType;
  const listArgs = {
    page,
    page_size: pageSize,
    source_type: normalizedSourceType,
    destination_id: destinationId.trim(),
    source_id: sourceId.trim(),
  };

  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
    error: listError,
  } = useRecordListQuery(listArgs, { skip: Boolean(searchQuery) });

  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
    error: searchError,
  } = useSearchRecordQuery(
    {
      query: searchQuery,
      source_type: normalizedSourceType,
      destination_id: destinationId.trim(),
      limit: pageSize,
    },
    { skip: !searchQuery },
  );

  const [deleteRecord, { isLoading: deletingOne }] = useDeleteRecordMutation();
  const [deleteBulkRecord, { isLoading: deletingBulk }] =
    useDeleteBulkRecordMutation();

  const activeData = searchQuery ? searchData : listData;
  const records = useMemo(() => {
    const items = getItems(activeData);
    if (!searchQuery || !sourceId.trim()) return items;
    return items.filter(
      (record) => String(record.source_id) === sourceId.trim(),
    );
  }, [activeData, searchQuery, sourceId]);
  const totalItems = searchQuery
    ? records.length
    : getTotal(listData, records.length);
  const isLoading = searchQuery
    ? searchLoading || searchFetching
    : listLoading || listFetching;
  const error = searchQuery ? searchError : listError;
  const deleting = deletingOne || deletingBulk;

  const resetPageSelection = () => {
    setPage(1);
    setSelectedIds([]);
  };

  const updateFilter = (setter, value) => {
    setter(value);
    resetPageSelection();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchQuery(queryInput.trim());
    resetPageSelection();
  };

  const clearSearch = () => {
    setQueryInput("");
    setSearchQuery("");
    resetPageSelection();
  };

  const resetFilters = () => {
    setSourceType("all");
    setDestinationId("");
    setSourceId("");
    resetPageSelection();
  };

  const confirmConfigUpdate = async () => {
    const nextValue = !isVectorizationEnabled;

    try {
      await updateAppConfig({
        payload: {
          is_vectorize_enabled: nextValue,
        },
      }).unwrap();
      toast.success(
        `Vectorization ${nextValue ? "enabled" : "disabled"} successfully`,
      );
      setIsConfigDialogOpen(false);
    } catch (updateError) {
      toast.error(
        errorMessage(updateError, "Could not update vectorization status"),
      );
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget === "bulk") {
        const response = await deleteBulkRecord({ ids: selectedIds }).unwrap();
        const deletedCount = response?.deleted?.length || selectedIds.length;
        const missingCount = response?.missing?.length || 0;
        toast.success(
          `${deletedCount} record${deletedCount === 1 ? "" : "s"} deleted${
            missingCount ? ` · ${missingCount} missing` : ""
          }`,
        );
        setSelectedIds([]);
      } else {
        await deleteRecord({ recordId: deleteTarget.id }).unwrap();
        toast.success("Vector record deleted successfully");
        setSelectedIds((current) =>
          current.filter((id) => id !== deleteTarget.id),
        );
      }
      setDeleteTarget(null);
    } catch (deleteError) {
      toast.error(
        errorMessage(deleteError, "The vector record could not be deleted"),
      );
    }
  };

  return (
    <section className="space-y-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flx gap-4">
          <div className="flex size-11 rounded-2xl bg-primary/10 text-primary center">
            <Database className="size-5" />
          </div>
          <div>
            <Title variant="lg">Vector store</Title>
            <Text variant="sm" className="mt-1 max-w-xl">
              Browse embedded content, inspect metadata, and run semantic
              similarity searches.
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end rounded-2xl border border-primary/30 bg-white px-4 py-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">
              Vectorization
            </p>
            <p className="text-xs text-slate-500">
              {isConfigLoading
                ? "Loading status…"
                : isVectorizationEnabled
                  ? "Enabled"
                  : "Disabled"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isVectorizationEnabled}
            aria-label={`${isVectorizationEnabled ? "Disable" : "Enable"} vectorization`}
            disabled={isConfigLoading || isConfigFetching || isUpdatingConfig}
            onClick={() => setIsConfigDialogOpen(true)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 ${
              isVectorizationEnabled ? "bg-primary" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-primary-foreground shadow-sm transition-transform ${
                isVectorizationEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <VectorFilter
        queryInput={queryInput}
        sourceType={sourceType}
        destinationId={destinationId}
        sourceId={sourceId}
        onQueryInputChange={setQueryInput}
        onSearch={handleSearch}
        onClearSearch={clearSearch}
        onSourceTypeChange={(value) => updateFilter(setSourceType, value)}
        onDestinationIdChange={(value) => updateFilter(setDestinationId, value)}
        onSourceIdChange={(value) => updateFilter(setSourceId, value)}
        onReset={resetFilters}
      />

      {searchQuery && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Semantic results for{" "}
              <strong className="font-semibold">“{searchQuery}”</strong>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearSearch}>
            Back to all records
          </Button>
        </div>
      )}

      <VectorTable
        records={records}
        totalItems={totalItems}
        isLoading={isLoading}
        error={error}
        searchQuery={searchQuery}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        onDeleteRequest={setDeleteTarget}
        page={page}
        pageSize={pageSize}
        onPageChange={(value) => {
          setPage(value);
          setSelectedIds([]);
        }}
        onPageSizeChange={(value) => {
          setPageSize(value);
          resetPageSelection();
        }}
      />

      <ConfirmDialog
        open={isConfigDialogOpen}
        setOpen={setIsConfigDialogOpen}
        title={`${isVectorizationEnabled ? "Disable" : "Enable"} vectorization?`}
        description={
          isVectorizationEnabled
            ? "New and updated content will no longer be vectorized until this feature is enabled again."
            : "New and updated content will be vectorized for semantic search."
        }
        confirmText={isVectorizationEnabled ? "Disable" : "Enable"}
        confirmVariant={isVectorizationEnabled ? "destructive" : "default"}
        onConfirm={confirmConfigUpdate}
        isLoading={isUpdatingConfig}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        setOpen={(open) => !open && setDeleteTarget(null)}
        title={
          deleteTarget === "bulk"
            ? `Delete ${selectedIds.length} records?`
            : "Delete vector record?"
        }
        description={`This permanently removes the selected vector ${
          deleteTarget === "bulk" && selectedIds.length !== 1
            ? "records"
            : "record"
        }. This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleting}
      />
    </section>
  );
};

export default VectorStorePage;
