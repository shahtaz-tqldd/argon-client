import { useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/dialog/confirm-dialog";
import {
  useDeleteKnowledgeMutation,
  useKnowledgeListQuery,
  useKnowledgeUsageQuery,
  useLazyKnowledgeDetailsQuery,
  useUpdateKnowledgeMutation,
  useUploadKnowledgeMutation,
} from "@/features/knowledge/knowledgeApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import KnowledgeSourceDetailsDialog from "./dialogs/knowledge-source-details-dialog";
import RenameKnowledgeSourceDialog from "./dialogs/rename-knowledge-source-dialog";
import UpdateCustomKnowledgeDialog from "./dialogs/update-custom-knowledge-dialog";
import KnowledgeSourceList from "./knowledge-source-list";
import KnowledgeSourceUsage from "./knowledge-source-usage";
import {
  finiteNumber,
  firstDefined,
  getResponseDetails,
  getResponseMeta,
  getResponseRecords,
  normalizeSource,
} from "./knowledge-source-utils";
import UploadKnowledgeSourceDialog from "./upload-knowledge-source-dialog";

const KnowledgeSourceTab = ({ chatbotSlug, chatbotName }) => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewingSource, setViewingSource] = useState(null);
  const [renamingSource, setRenamingSource] = useState(null);
  const [editingSource, setEditingSource] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
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
  const {
    data: knowledgeUsageResponse,
    isLoading: isUsageLoading,
    isFetching: isUsageFetching,
    isError: isUsageError,
    refetch: refetchUsage,
  } = useKnowledgeUsageQuery(
    { chatbotSlug },
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
    () =>
      getResponseRecords(data)
        .map(normalizeSource)
        .filter((source) => source.id),
    [data],
  );
  const meta = getResponseMeta(data);
  const totalSources = finiteNumber(
    firstDefined(meta, ["count", "total", "total_count", "total_items"]) ??
      sources.length,
    sources.length,
  );
  const knowledgeUsage = getResponseDetails(knowledgeUsageResponse) || {};

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
      toast.success(
        response?.message || "Knowledge source added and training started",
      );
      return true;
    } catch (uploadError) {
      toast.error(
        getApiErrorMessage(uploadError, "Unable to add the knowledge source."),
      );
      return false;
    }
  };

  const loadSourceDetails = async (source) => {
    try {
      const response = await getKnowledgeDetails({
        knowledgeBaseId: source.id,
      }).unwrap();
      const details = getResponseDetails(response);
      return { ...source, ...normalizeSource(details) };
    } catch (detailsError) {
      toast.error(
        getApiErrorMessage(detailsError, "Unable to load the source details."),
      );
      return null;
    }
  };

  const viewSourceDetails = async (_, row) => {
    const source = row.raw;
    setViewingSource(source);
    const details = await loadSourceDetails(source);
    setViewingSource(details);
  };

  const openContentEditor = async (_, row) => {
    const details = await loadSourceDetails(row.raw);
    if (details) setEditingSource(details);
  };

  const renameSource = async (name) => {
    try {
      await updateKnowledge({
        chatbotSlug,
        knowledgeBaseId: renamingSource.id,
        type: renamingSource.apiType,
        payload: { title: name },
      }).unwrap();
      toast.success("Knowledge source renamed");
      return true;
    } catch (updateError) {
      toast.error(
        getApiErrorMessage(
          updateError,
          "Unable to rename the knowledge source.",
        ),
      );
      return false;
    }
  };

  const toggleSourceAvailability = async (source) => {
    const isEnabled = !source.isEnabled;

    try {
      await updateKnowledge({
        chatbotSlug,
        knowledgeBaseId: source.id,
        type: source.apiType,
        payload: { is_enabled: isEnabled },
      }).unwrap();
      toast.success(`Knowledge source ${isEnabled ? "enabled" : "disabled"}`);
      return true;
    } catch (updateError) {
      toast.error(
        getApiErrorMessage(
          updateError,
          `Unable to ${isEnabled ? "enable" : "disable"} the knowledge source.`,
        ),
      );
      return false;
    }
  };

  const retrainSource = async (source) => {
    try {
      const response = await updateKnowledge({
        chatbotSlug,
        knowledgeBaseId: source.id,
        type: source.apiType,
      }).unwrap();
      toast.success(
        response?.message || "Knowledge source queued for retraining",
      );
      return true;
    } catch (updateError) {
      toast.error(
        getApiErrorMessage(updateError, "Unable to retrain the knowledge source."),
      );
      return false;
    }
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;

    const completed =
      pendingAction.type === "availability"
        ? await toggleSourceAvailability(pendingAction.source)
        : await retrainSource(pendingAction.source);

    if (completed) setPendingAction(null);
  };

  const updateCustomSource = async (content) => {
    try {
      const response = await updateKnowledge({
        chatbotSlug,
        knowledgeBaseId: editingSource.id,
        type: "custom",
        payload: { content },
      }).unwrap();
      toast.success(
        response?.message || "Replacement content queued for training",
      );
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
      if (sources.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      toast.success(response?.message || "Knowledge source deleted");
      return true;
    } catch (deleteError) {
      toast.error(
        getApiErrorMessage(deleteError, "Unable to delete the knowledge source."),
      );
      return false;
    }
  };

  const pendingSource = pendingAction?.source;
  const isAvailabilityAction = pendingAction?.type === "availability";
  const isRetryAction = pendingSource?.apiType === "file";

  return (
    <div className="space-y-5">
      <KnowledgeSourceUsage
        usage={knowledgeUsage}
        isLoading={isUsageLoading || isUsageFetching}
        isError={isUsageError}
        onRetry={refetchUsage}
        onSearchContent={() =>
          toast.info("Vector content search will be available here soon.")
        }
      />

      <KnowledgeSourceList
        chatbotSlug={chatbotSlug}
        chatbotName={chatbotName}
        sources={sources}
        totalSources={totalSources}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        isLoading={isLoading || isFetching}
        isError={isError}
        error={error}
        onRetry={refetch}
        onAdd={() => setUploadOpen(true)}
        onViewDetails={viewSourceDetails}
        onRename={setRenamingSource}
        onChangeAvailability={(source) =>
          setPendingAction({ type: "availability", source })
        }
        onRetrain={(source) =>
          setPendingAction({ type: "retrain", source })
        }
        onUpdateContent={openContentEditor}
        onDelete={removeSource}
        isLoadingDetails={isLoadingDetails}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      <UploadKnowledgeSourceDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onAdd={addSource}
        isLoading={isUploading}
      />
      <KnowledgeSourceDetailsDialog
        source={viewingSource}
        onClose={() => setViewingSource(null)}
        isLoading={isLoadingDetails}
      />
      {renamingSource && (
        <RenameKnowledgeSourceDialog
          key={renamingSource.id}
          source={renamingSource}
          onClose={() => setRenamingSource(null)}
          onSave={renameSource}
          isLoading={isUpdating}
        />
      )}
      {editingSource && (
        <UpdateCustomKnowledgeDialog
          key={editingSource.id}
          source={editingSource}
          onClose={() => setEditingSource(null)}
          onSave={updateCustomSource}
          isLoading={isUpdating}
        />
      )}
      <ConfirmDialog
        open={Boolean(pendingAction)}
        setOpen={(open) => {
          if (!open) setPendingAction(null);
        }}
        title={
          isAvailabilityAction
            ? `${pendingSource?.isEnabled ? "Disable" : "Enable"} ${pendingSource?.name || "this source"}?`
            : `${isRetryAction ? "Retry training for" : "Retrain"} ${pendingSource?.name || "this source"}?`
        }
        description={
          isAvailabilityAction
            ? pendingSource?.isEnabled
              ? "This source will no longer be used when the chatbot answers questions. You can enable it again later."
              : "This source will become available to the chatbot when it answers questions."
            : isRetryAction
              ? "This will retry processing the failed file and rebuild its indexed knowledge."
              : "This will crawl the website again and rebuild its indexed knowledge with the latest content."
        }
        confirmText={
          isAvailabilityAction
            ? pendingSource?.isEnabled
              ? "Disable"
              : "Enable"
            : isRetryAction
              ? "Retry training"
              : "Retrain"
        }
        confirmVariant={
          isAvailabilityAction && pendingSource?.isEnabled
            ? "destructive"
            : "default"
        }
        onConfirm={confirmPendingAction}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default KnowledgeSourceTab;
