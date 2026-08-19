import { useState } from "react";
import moment from "moment";
import { Database, Eye, Trash2 } from "lucide-react";

import Pagination from "@/components/table/pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sourceStyles = {
  destination: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  attraction: "bg-violet-50 text-violet-700 ring-violet-600/20",
  cuisine: "bg-amber-50 text-amber-700 ring-amber-600/20",
  activity: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

const errorMessage = (error, fallback) =>
  error?.data?.message ||
  error?.data?.detail ||
  error?.data?.error?.[0] ||
  fallback;

const shortId = (value) => {
  if (!value) return "Not available";
  return value.length > 18 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
};

const formatDateTime = (value) =>
  value && moment(value).isValid()
    ? moment(value).format("MMM D, YYYY · h:mm A")
    : "Not available";

const formatDate = (value) =>
  value && moment(value).isValid()
    ? moment(value).format("MMM D, YYYY")
    : "Not available";

const formatMetadata = (metadata) => {
  if (metadata == null) return "{}";
  if (typeof metadata === "string") {
    try {
      return JSON.stringify(JSON.parse(metadata), null, 2);
    } catch {
      return metadata;
    }
  }
  return JSON.stringify(metadata, null, 2);
};

function SourceBadge({ value }) {
  const sourceAliases = {
    destinations: "destination",
    attractions: "attraction",
    cuisines: "cuisine",
    activities: "activity",
  };
  const sourceValue = String(value || "unknown").toLowerCase();
  const normalized = sourceAliases[sourceValue] || sourceValue;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
        sourceStyles[normalized] ||
        "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      {normalized}
    </span>
  );
}

function TableSkeleton({ rows }) {
  return Array.from({ length: Math.min(rows, 6) }).map((_, index) => (
    <TableRow key={index} className="border-slate-100 hover:bg-transparent">
      <TableCell className="px-5 py-5" colSpan={5}>
        <div className="flex items-center gap-5">
          <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 max-w-lg flex-1 animate-pulse rounded-full bg-slate-200" />
        </div>
      </TableCell>
    </TableRow>
  ));
}

const VectorTable = ({
  records,
  totalItems,
  isLoading,
  error,
  searchQuery,
  selectedIds,
  onSelectedIdsChange,
  onDeleteRequest,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const [recordToView, setRecordToView] = useState(null);
  const allOnPageSelected =
    records.length > 0 &&
    records.every((record) => selectedIds.includes(record.id));

  const toggleAll = (checked) => {
    const pageIds = records.map((record) => record.id);
    onSelectedIdsChange((current) =>
      checked
        ? [...new Set([...current, ...pageIds])]
        : current.filter((id) => !pageIds.includes(id)),
    );
  };

  const toggleOne = (id, checked) => {
    onSelectedIdsChange((current) =>
      checked
        ? [...new Set([...current, id])]
        : current.filter((item) => item !== id),
    );
  };

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div>
            <p className="font-semibold text-slate-800">
              {searchQuery ? "Search results" : "Vector records"}
            </p>
            <p className="text-xs text-slate-500">
              {isLoading
                ? "Loading records…"
                : `${totalItems.toLocaleString()} record${totalItems === 1 ? "" : "s"}`}
            </p>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">
                {selectedIds.length} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl"
                onClick={() => onDeleteRequest("bulk")}
              >
                <Trash2 /> Delete selected
              </Button>
            </div>
          )}
        </div>

        <Table>
          <TableHeader className="bg-slate-50/90">
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="h-14 w-12 px-5">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all records on this page"
                />
              </TableHead>
              <TableHead className="h-14 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Source
              </TableHead>
              <TableHead className="h-14 min-w-80 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Content
              </TableHead>
              <TableHead className="h-14 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {searchQuery ? "Distance" : "Updated"}
              </TableHead>
              <TableHead className="h-14 w-24 px-5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={pageSize} />
            ) : error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-52 text-center">
                  <p className="font-semibold text-slate-700">
                    Could not load vector records
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {errorMessage(error, "Please try again in a moment.")}
                  </p>
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-56 p-5">
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 text-center">
                    <Database className="mb-3 h-7 w-7 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">
                      No vector records found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow
                  key={record.id}
                  className="border-slate-100 hover:bg-primary/[0.035]"
                >
                  <TableCell className="px-5 py-4">
                    <Checkbox
                      checked={selectedIds.includes(record.id)}
                      onCheckedChange={(checked) =>
                        toggleOne(record.id, checked)
                      }
                      aria-label={`Select record ${record.id}`}
                    />
                  </TableCell>
                  <TableCell className="px-3 py-4">
                    <div className="space-y-2">
                      <SourceBadge value={record.source_type} />
                      <p
                        className="max-w-40 truncate font-mono text-[11px] text-slate-500"
                        title={record.source_id}
                      >
                        {shortId(record.source_id)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xl whitespace-normal px-3 py-4">
                    <p className="line-clamp-2 text-sm leading-6 text-slate-700">
                      {record.content || "No content"}
                    </p>
                  </TableCell>
                  <TableCell className="px-3 py-4">
                    {searchQuery ? (
                      <p className="text-sm font-medium text-slate-700">
                        {record?.distance}
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-slate-700">
                          {formatDateTime(record.updated_at)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Created on {formatDate(record.created_at)}
                        </p>
                      </>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="View record"
                        onClick={() => setRecordToView(record)}
                      >
                        <Eye />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Delete record"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onDeleteRequest(record)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!searchQuery && totalItems > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-9 w-20 rounded-xl border-slate-200 bg-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, totalItems)} of {totalItems}
              </p>
            </div>
            <Pagination
              page={page}
              setPage={onPageChange}
              total={totalItems}
              pageSize={pageSize}
            />
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(recordToView)}
        onOpenChange={(open) => !open && setRecordToView(null)}
      >
        <DialogContent className="rounded-3xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vector record</DialogTitle>
            <DialogDescription>
              Complete stored content and metadata.
            </DialogDescription>
          </DialogHeader>
          {recordToView && (
            <div className="space-y-5 pt-2 custom-scrollbar max-h-[80vh]">
              <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Record ID
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-700">
                    {recordToView.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Source ID
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-700">
                    {recordToView.source_id || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Source type
                  </p>
                  <div className="mt-1">
                    <SourceBadge value={recordToView.source_type} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Destination ID
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-700">
                    {recordToView.destination_id ||
                      recordToView.metadata?.destination_id ||
                      "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Created
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatDateTime(recordToView.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Updated
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatDateTime(recordToView.updated_at)}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Content
                </p>
                <div className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                  {recordToView.content || "No content"}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Metadata
                </p>
                <pre className="max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-emerald-300">
                  {formatMetadata(recordToView.metadata)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VectorTable;
