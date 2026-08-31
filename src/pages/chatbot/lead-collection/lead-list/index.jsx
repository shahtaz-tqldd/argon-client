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
import { useCapturedLeadListQuery } from "@/features/lead_captures/leadCaptureApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { getInitials } from "@/lib/utils";

import LeadDetailsDialog, { Score, StatusBadge } from "./lead-details-dialog";
import {
  displayValue,
  formatDateTime,
  humanize,
  LEAD_STATUSES,
} from "./lead-utils";

const columns = [
  { header: "Lead", accessorKey: "lead" },
  { header: "Company", accessorKey: "company" },
  { header: "Location", accessorKey: "location" },
  { header: "Source", accessorKey: "source" },
  { header: "Score", accessorKey: "score" },
  { header: "Status", accessorKey: "status" },
  { header: "Captured", accessorKey: "captured" },
  { header: "", accessorKey: "action" },
];

function LeadIdentity({ lead }) {
  return (
    <div className="flex min-w-52 items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {getInitials(lead.name || "Unknown lead")}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {displayValue(lead.name)}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {displayValue(lead.email)}
        </p>
      </div>
    </div>
  );
}

const baseCsvFields = [
  ["Lead ID", (lead) => lead.id],
  ["Name", (lead) => lead.name],
  ["Email", (lead) => lead.email],
  ["Phone", (lead) => lead.phone],
  ["Address", (lead) => lead.address],
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

const downloadLeads = (leads) => {
  if (!leads.length) return;

  const customFieldKeys = [
    ...new Set(leads.flatMap((lead) => Object.keys(lead.custom_fields || {}))),
  ];
  const csvFields = [
    ...baseCsvFields,
    ...customFieldKeys.map((key) => [
      humanize(key),
      (lead) => lead.custom_fields?.[key],
    ]),
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
  const { data, isLoading, isFetching, isError, error, refetch } =
    useCapturedLeadListQuery(
      { chatbotSlug, page, pageSize },
      { skip: !chatbotSlug },
    );

  const leads = useMemo(
    () => (Array.isArray(data?.data) ? data.data : []),
    [data],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const visibleLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const searchableText = [
          lead.name,
          lead.email,
          lead.phone,
          lead.address,
          lead.detected_city,
          lead.detected_country_code,
          lead.source,
          lead.status,
          ...Object.values(lead.custom_fields || {}),
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
    const location = [lead.detected_city, lead.detected_country_code]
      .filter(Boolean)
      .join(", ");

    return {
      id: lead.id,
      raw: lead,
      raw_name: lead.name,
      lead: <LeadIdentity lead={lead} />,
      company: (
        <div className="min-w-32">
          <p className="text-xs font-semibold text-foreground">
            {displayValue(lead.custom_fields?.company)}
          </p>
          {lead.custom_fields?.team_size && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Team {lead.custom_fields.team_size}
            </p>
          )}
        </div>
      ),
      location: (
        <div className="min-w-28">
          <p className="text-xs font-medium text-foreground">
            {displayValue(location)}
          </p>
          {lead.address && (
            <p
              className="mt-0.5 max-w-40 truncate text-[11px] text-muted-foreground"
              title={lead.address}
            >
              {lead.address}
            </p>
          )}
        </div>
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
            {isError && (
              <Button size="sm" variant="outline" onClick={refetch}>
                <RefreshCw />
                Retry
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={!exportLeads.length}
              onClick={() => downloadLeads(exportLeads)}
            >
              <Download />
              {selectedIds.length ? `Export ${selectedIds.length}` : "Export page"}
            </Button>
          </div>
        }
        data={rows}
        columns={columns}
        isLoading={isLoading || isFetching}
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
        emptyTitle={isError ? "Unable to load leads" : "No leads found"}
        emptyDescription={
          isError
            ? getApiErrorMessage(error, "Please try again later.")
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
