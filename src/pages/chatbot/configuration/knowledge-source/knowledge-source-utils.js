import { formatDateTime } from "@/lib/date-time";

export const getResponseRecords = (response) => {
  const containers = [response, response?.data, response?.data?.data];

  for (const container of containers) {
    if (Array.isArray(container)) return container;

    for (const key of ["results", "items", "sources", "knowledge_bases"]) {
      if (Array.isArray(container?.[key])) return container[key];
    }
  }

  return [];
};

export const getResponseMeta = (response) =>
  response?.meta ||
  response?.data?.meta ||
  response?.pagination ||
  response?.data?.pagination ||
  {};

export const getResponseDetails = (response) => {
  const data = response?.data ?? response;
  return data?.data && !Array.isArray(data.data) ? data.data : data;
};

export const firstDefined = (object, keys) => {
  for (const key of keys) {
    if (object?.[key] !== undefined && object[key] !== null) {
      return object[key];
    }
  }

  return undefined;
};

export const finiteNumber = (value, fallback = 0) => {
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

export const normalizeStatus = (value) => {
  const status = String(value || "processing").toLowerCase();

  if (
    ["ready", "trained", "completed", "complete", "success"].includes(status)
  ) {
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

export const normalizeSource = (source) => {
  const apiType = normalizeType(
    firstDefined(source, [
      "type",
      "source_type",
      "knowledge_type",
      "content_type",
    ]),
  );
  const fileType = String(
    firstDefined(source, ["file_type", "mime_type"]) || "",
  )
    .trim()
    .toUpperCase();
  const fileValue = firstDefined(source, [
    "file_name",
    "filename",
    "original_filename",
  ]);
  const filePath =
    typeof source.file === "string" ? source.file : source.file?.name;
  const fileName = fileValue || fileNameFromPath(filePath);
  const url = firstDefined(source, ["url", "source_url"]);
  const content = firstDefined(source, ["content", "text", "text_content"]);
  const title = firstDefined(source, ["title", "name"]);
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
        ? fileType
          ? `${fileType} file`
          : fileName || "Uploaded file"
        : content || "Custom text content";
  const enabled = firstDefined(source, ["is_enabled", "enabled"]);

  return {
    id: firstDefined(source, ["id", "knowledge_base_id", "uuid"]),
    name: title || fallbackTitle,
    detail: String(detail || typeLabel(apiType)),
    apiType,
    type: typeLabel(apiType),
    url,
    content,
    fileType,
    originalFilename:
      firstDefined(source, ["original_filename", "file_name", "filename"]) ||
      fileName,
    fileUrl: firstDefined(source, ["file_url", "download_url"]),
    size: formatBytes(rawSize),
    isEnabled:
      enabled === undefined ||
      enabled === true ||
      enabled === 1 ||
      enabled === "true",
    status: normalizeStatus(
      firstDefined(source, ["status", "training_status", "processing_status"]),
    ),
    updated: formatDateTime(
      firstDefined(source, [
        "updated_at",
        "processed_at",
        "last_crawled_at",
        "last_trained_at",
        "created_at",
      ]),
    ),
    processed: formatDateTime(firstDefined(source, ["processed_at"])),
    lastCrawled: formatDateTime(firstDefined(source, ["last_crawled_at"])),
    created: formatDateTime(firstDefined(source, ["created_at"])),
    errorMessage: firstDefined(source, ["error_message", "error"]),
    latestTraining: firstDefined(source, ["latest_training", "training"]),
    raw: source,
  };
};
