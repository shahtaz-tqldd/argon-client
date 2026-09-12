import { useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCapturedLeadListQuery,
  useLeadCaptureConfigureQuery,
} from "@/features/lead_captures/leadCaptureApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import LeadDetailsDialog, { Score, StatusBadge } from "./lead-details-dialog";
import {
  displayValue,
  formatDateTime,
  humanize,
  LEAD_STATUSES,
} from "./lead-utils";

const metadataColumns = [
  { header: "Source", accessorKey: "source" },
  { header: "Score", accessorKey: "score" },
  { header: "Status", accessorKey: "status" },
  { header: "Captured", accessorKey: "captured" },
  { header: "", accessorKey: "action" },
];

const metadataCsvFields = [
  ["City", (lead) => lead.detected_city],
  ["Country", (lead) => lead.detected_country_code],
  ["Status", (lead) => lead.status],
  ["Lead score", (lead) => lead.lead_score],
  ["Source", (lead) => lead.source],
  ["Notes", (lead) => lead.notes_count],
  ["Created at", (lead) => lead.created_at],
  ["Updated at", (lead) => lead.updated_at],
];

const escapeCsvCell = (value) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;

const downloadLeads = (leads, configuredFields) => {
  if (!leads.length) return;

  const csvFields = [
    ["Lead ID", (lead) => lead.id],
    ...configuredFields.map((field) => [
      field.label,
      (lead) => lead.collected_fields?.[field.value],
    ]),
    ...metadataCsvFields,
  ];
  const csv = [
    csvFields.map(([label]) => escapeCsvCell(label)).join(","),
    ...leads.map((lead) =>
      csvFields.map(([, read]) => escapeCsvCell(read(lead))).join(","),
    ),
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `argon-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  toast.success(`${leads.length} lead${leads.length === 1 ? "" : "s"} exported`);
};

const LeadListTab = () => {
  const { chatbotSlug } = useCurrentChatbot();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [dialogView, setDialogView] = useState("details");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: refetchLeads,
  } = useCapturedLeadListQuery(
      { chatbotSlug, page, pageSize },
      { skip: !chatbotSlug },
    );
  const {
    data: configResponse,
    isLoading: isConfigLoading,
    isFetching: isConfigFetching,
    isError: isConfigError,
    error: configError,
    refetch: refetchConfig,
  } = useLeadCaptureConfigureQuery(
    { chatbotSlug },
    { skip: !chatbotSlug },
  );

  const leads = useMemo(
    () => (Array.isArray(data?.data) ? data.data : []),
    [data],
  );
  const configuredFields = useMemo(
    () => {
      const config = configResponse?.data ?? configResponse;

      return (Array.isArray(config?.collectable_fields)
        ? config.collectable_fields
        : []
      ).filter(
        (field) =>
          field?.mode !== "hidden" &&
          typeof field?.value === "string" &&
          field.value,
      );
    },
    [configResponse],
  );
  const columns = useMemo(
    () => [
      ...configuredFields.map((field, index) => ({
        header: field.label || humanize(field.value),
        accessorKey: `collected_field_${index}`,
      })),
      ...metadataColumns,
    ],
    [configuredFields],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const visibleLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const searchableText = [
          lead.detected_city,
          lead.detected_country_code,
          lead.source,
          lead.status,
          ...Object.values(lead.collected_fields || {}),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
          (status === "all" || String(lead.status).toLowerCase() === status)
        );
      }),
    [leads, normalizedQuery, status],
  );
  const availableStatuses = useMemo(
    () => {
      const statuses = [
        ...LEAD_STATUSES,
        ...leads
        .map((lead) => lead.status)
        .filter((item) => typeof item === "string" && item),
      ];
      if (status !== "all") statuses.push(status);

      return [...new Set(statuses)].sort((left, right) =>
        left.localeCompare(right),
      );
    },
    [leads, status],
  );

  const openLeadDialog = (lead, view = "details") => {
    setDialogView(view);
    setSelectedLead(lead);
  };

  const rows = visibleLeads.map((lead) => {
    const collectedFields = lead.collected_fields || {};
    const normalizedLead = { ...lead, ...collectedFields };

    return {
      id: lead.id,
      raw: normalizedLead,
      raw_name: collectedFields.name || collectedFields.email || lead.id,
      ...Object.fromEntries(
        configuredFields.map((field, index) => [
          `collected_field_${index}`,
          <span
            key={field.value}
            className="block max-w-56 truncate text-xs font-medium text-foreground"
            title={displayValue(collectedFields[field.value])}
          >
            {displayValue(collectedFields[field.value])}
          </span>,
        ]),
      ),
      source: (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {humanize(lead.source || "Unknown")}
        </span>
      ),
      score: <Score value={lead.lead_score} />,
      status: <StatusBadge status={lead.status} />,
      captured: (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(lead.created_at)}
        </span>
      ),
      action: "",
    };
  });

  const hasActiveFilter = Boolean(normalizedQuery || status !== "all");
  const exportLeads = selectedIds.length
    ? visibleLeads.filter((lead) => selectedIds.includes(lead.id))
    : visibleLeads;
  const changePage = (nextPage) => {
    setSelectedIds([]);
    setPage(nextPage);
  };
  const changePageSize = (nextPageSize) => {
    setSelectedIds([]);
    setPageSize(nextPageSize);
  };
  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setSelectedIds([]);
    setPage(1);
  };
  const refetch = () => {
    refetchLeads();
    refetchConfig();
  };
  const tableError = error || configError;

  return (
    <>
      <ReusableTable
        title="Collected leads"
        description={
          hasActiveFilter
            ? `${visibleLeads.length} matching lead${visibleLeads.length === 1 ? "" : "s"} on this page`
            : `${data?.meta?.count ?? leads.length} lead${(data?.meta?.count ?? leads.length) === 1 ? "" : "s"} collected`
        }
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative hidden sm:block">
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedIds([]);
                }}
                className="h-9 w-52 rounded-xl bg-slate-50"
                placeholder="Search this page"
                aria-label="Search leads on this page"
              />
            </label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setSelectedIds([]);
              }}
            >
              <SelectTrigger className="h-9 w-36 rounded-xl bg-slate-50">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {availableStatuses.map((item) => (
                  <SelectItem key={item} value={item.toLowerCase()}>
                    {humanize(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilter && (
              <Button size="sm" variant="ghost" onClick={resetFilters}>
                Clear
              </Button>
            )}
            {(isError || isConfigError) && (
              <Button size="sm" variant="outline" onClick={refetch}>
                <RefreshCw />
                Retry
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={!exportLeads.length}
              onClick={() => downloadLeads(exportLeads, configuredFields)}
            >
              <Download />
              {selectedIds.length ? `Export ${selectedIds.length}` : "Export page"}
            </Button>
          </div>
        }
        data={rows}
        columns={columns}
        isLoading={
          isLoading || isFetching || isConfigLoading || isConfigFetching
        }
        totalItems={
          hasActiveFilter
            ? visibleLeads.length
            : data?.meta?.count ?? leads.length
        }
        page={hasActiveFilter ? 1 : page}
        setPage={changePage}
        pageSize={pageSize}
        setPageSize={changePageSize}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        table_options={[
          {
            label: "View lead details",
            action: (_, row) => openLeadDialog(row.raw, "details"),
          },
          {
            label: "Add note",
            action: (_, row) => openLeadDialog(row.raw, "add-note"),
          },
          {
            label: "View notes",
            action: (_, row) => openLeadDialog(row.raw, "notes"),
          },
        ]}
        emptyTitle={
          isError || isConfigError ? "Unable to load leads" : "No leads found"
        }
        emptyDescription={
          isError || isConfigError
            ? getApiErrorMessage(tableError, "Please try again later.")
            : hasActiveFilter
              ? "No leads on this page match your filters."
              : "New captured leads will appear here."
        }
      />

      <LeadDetailsDialog
        key={`${selectedLead?.id || "closed"}-${dialogView}`}
        chatbotSlug={chatbotSlug}
        summary={selectedLead}
        initialView={dialogView}
        onClose={() => setSelectedLead(null)}
      />
    </>
  );
};

export default LeadListTab;
