import { useMemo, useState } from "react";
import {
  Activity,
  Building2,
  ChevronRight,
  Download,
  Facebook,
  Flame,
  Globe2,
  Instagram,
  Mail,
  MessageCircleMore,
  Phone,
  Search,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  UserRoundCheck,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FloatingSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TabMenu from "@/components/ui/tab";
import { cn, getInitials } from "@/lib/utils";

import { initialLeads } from "./demo-data";
import { SectionTitle } from "@/components/ui/section";
import LeadCaptureConfig from "./config";
import LeadAnalyticsTab from "./analytics";

const pageTabs = [
  {
    value: "leads",
    label: "Collected leads",
    icon: UserRoundSearch,
    count: 286,
  },
  { value: "analysis", label: "Lead analysis", icon: TrendingUp },
  { value: "settings", label: "Settings", icon: Settings2 },
];

const channelMeta = {
  Website: { icon: Globe2, tone: "bg-sky-500/10 text-sky-600" },
  WhatsApp: {
    icon: MessageCircleMore,
    tone: "bg-emerald-500/10 text-emerald-600",
  },
  Instagram: { icon: Instagram, tone: "bg-fuchsia-500/10 text-fuchsia-600" },
  Facebook: { icon: Facebook, tone: "bg-blue-600/10 text-blue-600" },
};
const qualityStyles = {
  Hot: "bg-red-500/10 text-red-600 dark:text-red-400",
  Warm: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Cool: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
};
const statusStyles = {
  Qualified: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Contacted: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  New: "bg-primary/10 text-primary",
  Disqualified: "bg-muted text-muted-foreground",
};

function ChannelLabel({ source }) {
  const meta = channelMeta[source] || channelMeta.Website;
  const ChannelIcon = meta.icon;
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium">
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full",
          meta.tone,
        )}
      >
        <ChannelIcon className="size-3.5" />
      </span>
      {source}
    </span>
  );
}

function LeadIdentity({ lead }) {
  return (
    <div className="flex min-w-52 items-center gap-3">
      <div className="relative shrink-0">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {getInitials(lead.name)}
        </span>
        {lead.quality === "Hot" && (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border-2 border-card bg-red-500 text-white">
            <Flame className="size-2.5" />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {lead.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {lead.email}
        </p>
      </div>
    </div>
  );
}

function QualityScore({ lead }) {
  return (
    <div className="min-w-24">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
          qualityStyles[lead.quality],
        )}
      >
        {lead.quality === "Hot" && <Flame className="size-3" />}
        {lead.quality}
      </span>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${lead.score}%` }}
          />
        </span>
        <span className="text-[11px] font-semibold text-muted-foreground">
          {lead.score}
        </span>
      </div>
    </div>
  );
}

function LeadStatus({ lead }) {
  return (
    <div>
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold",
          statusStyles[lead.status],
        )}
      >
        {lead.status}
      </span>
      <p className="mt-2 text-[11px] text-muted-foreground">{lead.owner}</p>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  const DetailIcon = icon;
  return (
    <div className="flex gap-3">
      <DetailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium">{value}</p>
      </div>
    </div>
  );
}

function LeadDetailsDialog({ lead, onClose, onStatusChange }) {
  if (!lead) return null;
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-muted/30 px-6 py-6">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {getInitials(lead.name)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>{lead.name}</DialogTitle>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    qualityStyles[lead.quality],
                  )}
                >
                  {lead.quality} lead · {lead.score}
                </span>
              </div>
              <DialogDescription className="mt-1">
                {lead.role} at {lead.company}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid md:grid-cols-[0.9fr_1.35fr]">
          <section className="border-b p-6 md:border-b-0 md:border-r">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Contact details
            </p>
            <div className="mt-4 space-y-4">
              {[
                [Mail, "Email", lead.email],
                [Phone, "Phone", lead.phone],
                [Building2, "Company", lead.company],
                [Globe2, "Location", lead.location],
              ].map(([icon, label, value]) => (
                <DetailRow
                  key={label}
                  icon={icon}
                  label={label}
                  value={value}
                />
              ))}
            </div>
            <div className="mt-6 rounded-2xl border bg-muted/20 p-4">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Source conversation
              </p>
              <div className="mt-3 flex items-center justify-between">
                <ChannelLabel source={lead.source} />
                <button className="flex items-center gap-1 text-xs font-semibold text-primary">
                  {lead.session}
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-4">
              <FloatingSelect
                label="Lead status"
                value={lead.status}
                displayValue={lead.status}
                onValueChange={(value) => onStatusChange(lead.id, value)}
              >
                {["New", "Contacted", "Qualified", "Disqualified"].map(
                  (item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ),
                )}
              </FloatingSelect>
            </div>
          </section>
          <div>
            <section className="border-b p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  AI lead summary
                </p>
              </div>
              <p className="mt-3 text-sm leading-6">{lead.summary}</p>
              <div className="mt-4 rounded-xl bg-primary/[0.05] p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Detected intent
                </p>
                <p className="mt-1 text-xs font-semibold text-primary">
                  {lead.intent}
                </p>
              </div>
            </section>
            <section className="border-b p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Collected fields
              </p>
              <div className="mt-3 divide-y">
                {Object.entries(lead.fields).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 py-2.5 text-xs"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="p-6">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Activity
                </p>
              </div>
              <div className="mt-4 space-y-4">
                {lead.activity.map(([event, time], index) => (
                  <div key={event} className="relative flex gap-3">
                    {index < lead.activity.length - 1 && (
                      <span className="absolute left-[7px] top-5 h-[calc(100%+4px)] w-px bg-border" />
                    )}
                    <span className="relative mt-1.5 size-3.5 rounded-full border-[3px] border-primary/20 bg-primary" />
                    <div>
                      <p className="text-xs font-medium">{event}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const exportFields = [
  "Name",
  "Email",
  "Phone",
  "Company",
  "Role",
  "Source",
  "Score",
  "Status",
  "Owner",
  "Captured",
];

function ExportDialog({ open, onClose, leads, selectedCount }) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState(
    selectedCount ? `Selected leads (${selectedCount})` : "All leads",
  );
  const [dateRange, setDateRange] = useState("All time");
  const [fields, setFields] = useState(exportFields);
  const toggleField = (field) =>
    setFields((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field],
    );
  const runExport = async () => {
    const mapped = leads.map((lead) => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Company: lead.company,
      Role: lead.role,
      Source: lead.source,
      Score: lead.score,
      Status: lead.status,
      Owner: lead.owner,
      Captured: lead.captured,
    }));
    const data = mapped.map((row) =>
      Object.fromEntries(fields.map((field) => [field, row[field]])),
    );
    if (format === "Excel") {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(data),
        "Leads",
      );
      XLSX.writeFile(workbook, "atlas-leads.xlsx");
    } else {
      const csv = [
        fields.join(","),
        ...data.map((row) =>
          fields
            .map(
              (field) => `"${String(row[field] ?? "").replaceAll('"', '""')}"`,
            )
            .join(","),
        ),
      ].join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "atlas-leads.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`${format} export downloaded`);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-xl">
        <DialogHeader className="border-b bg-muted/30 px-6 py-6">
          <span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Download className="size-5" />
          </span>
          <DialogTitle>Export lead data</DialogTitle>
          <DialogDescription>
            Choose the records, fields, and file format to download.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingSelect
              label="Format"
              value={format}
              displayValue={format}
              onValueChange={setFormat}
            >
              {["CSV", "Excel"].map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </FloatingSelect>
            <FloatingSelect
              label="Date range"
              value={dateRange}
              displayValue={dateRange}
              onValueChange={setDateRange}
            >
              {["All time", "Last 7 days", "Last 30 days", "This quarter"].map(
                (item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ),
              )}
            </FloatingSelect>
          </div>
          <FloatingSelect
            label="Export scope"
            value={scope}
            displayValue={scope}
            onValueChange={setScope}
          >
            {[
              "All leads",
              "Current filtered view",
              ...(selectedCount ? [`Selected leads (${selectedCount})`] : []),
            ].map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </FloatingSelect>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Included fields</p>
              <button
                onClick={() =>
                  setFields(
                    fields.length === exportFields.length ? [] : exportFields,
                  )
                }
                className="text-xs font-semibold text-primary"
              >
                {fields.length === exportFields.length
                  ? "Clear all"
                  : "Select all"}
              </button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {exportFields.map((field) => (
                <label
                  key={field}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs"
                >
                  <Checkbox
                    checked={fields.includes(field)}
                    onCheckedChange={() => toggleField(field)}
                  />
                  {field}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!fields.length} onClick={runExport}>
            <Download />
            Export {format}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeadsTab({ leads, setLeads, openLead, openExport }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const visible = useMemo(
    () =>
      leads.filter(
        (lead) =>
          `${lead.name} ${lead.email} ${lead.company}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "all" || lead.status.toLowerCase() === status),
      ),
    [leads, query, status],
  );
  const rows = visible
    .slice((page - 1) * pageSize, page * pageSize)
    .map((lead) => ({
      id: lead.id,
      raw: lead,
      lead: <LeadIdentity lead={lead} />,
      company: (
        <div>
          <p className="text-xs font-semibold text-foreground">
            {lead.company}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {lead.role}
          </p>
        </div>
      ),
      source: <ChannelLabel source={lead.source} />,
      quality: <QualityScore lead={lead} />,
      status: <LeadStatus lead={lead} />,
      captured: (
        <div>
          <p className="text-xs font-medium text-foreground">{lead.captured}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Session {lead.session}
          </p>
        </div>
      ),
      action: "",
    }));
  return (
    <div className="space-y-5">
      <ReusableTable
        title="Collected leads"
        description={`${visible.length} matching leads · Updated just now`}
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openExport(selectedIds)}
              >
                <Download />
                Export {selectedIds.length}
              </Button>
            )}
            <label className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className="h-9 w-52 rounded-xl bg-slate-50 pl-9"
                placeholder="Search leads"
              />
            </label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-36 rounded-xl bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["New", "Contacted", "Qualified", "Disqualified"].map(
                  (item) => (
                    <SelectItem key={item} value={item.toLowerCase()}>
                      {item}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        }
        data={rows}
        columns={[
          { header: "Lead", accessorKey: "lead" },
          { header: "Company", accessorKey: "company" },
          { header: "Source", accessorKey: "source" },
          { header: "Quality", accessorKey: "quality" },
          { header: "Status", accessorKey: "status" },
          { header: "Captured", accessorKey: "captured" },
          { header: "", accessorKey: "action" },
        ]}
        isLoading={false}
        totalItems={visible.length}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        table_options={[
          { label: "View lead details", action: (_, row) => openLead(row.raw) },
          {
            label: "Open conversation",
            action: (_, row) =>
              toast.success(`Opening conversation ${row.raw.session}`),
          },
          {
            label: "Mark as qualified",
            hidden: (row) => row.raw.status === "Qualified",
            action: (_, row) => {
              setLeads((current) =>
                current.map((lead) =>
                  lead.id === row.id ? { ...lead, status: "Qualified" } : lead,
                ),
              );
              toast.success("Lead marked as qualified");
            },
          },
          { label: "Delete lead", type: "delete" },
        ]}
        onDeleteConfirm={async (id) => {
          setLeads((current) => current.filter((lead) => lead.id !== id));
          setSelectedIds((current) => current.filter((item) => item !== id));
          toast.success("Lead deleted");
        }}
        deleteLoading={false}
        emptyTitle="No leads found"
        emptyDescription="Try changing your search or status filter."
      />
    </div>
  );
}

const LeadCollectionPage = () => {
  const [activeTab, setActiveTab] = useState("leads");
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLead, setSelectedLead] = useState(null);
  const [exportState, setExportState] = useState({ open: false, ids: [] });
  const openExport = (ids = []) => setExportState({ open: true, ids });
  const exportLeads = exportState.ids.length
    ? leads.filter((lead) => exportState.ids.includes(lead.id))
    : leads;
  const updateStatus = (id, status) => {
    setLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
    );
    setSelectedLead((current) =>
      current?.id === id ? { ...current, status } : current,
    );
    toast.success(`Lead marked as ${status.toLowerCase()}`);
  };
  return (
    <section className="mx-auto max-w-7xl space-y-6 pb-8">
      <SectionTitle
        icon={UserRoundSearch}
        title="Lead Collections"
        details=" Capture, qualify, and route high-intent visitors from every channel."
      />

      <div className="flbx">
        <TabMenu
          tabs={pageTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          scrollable
          className="w-fit bg-background/95 backdrop-blur"
        />

        <Button size="sm" variant="outline" onClick={() => openExport([])}>
          <Download />
          Export
        </Button>
      </div>
      {activeTab === "leads" && (
        <LeadsTab
          leads={leads}
          setLeads={setLeads}
          openLead={setSelectedLead}
          openExport={openExport}
        />
      )}
      {activeTab === "analysis" && <LeadAnalyticsTab />}
      {activeTab === "settings" && <LeadCaptureConfig />}
      <LeadDetailsDialog
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={updateStatus}
      />
      <ExportDialog
        key={`${exportState.open}-${exportState.ids.join("-")}`}
        open={exportState.open}
        onClose={() => setExportState({ open: false, ids: [] })}
        leads={exportLeads}
        selectedCount={exportState.ids.length}
      />
    </section>
  );
};

export default LeadCollectionPage;
