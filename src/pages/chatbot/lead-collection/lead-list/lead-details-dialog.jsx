import { useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  Globe2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  useCapturedLeadDetailQuery,
  useUpdateCapturedLeadMutation,
} from "@/features/lead_captures/leadCaptureApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn, getInitials } from "@/lib/utils";

import LeadNotes from "./lead-notes";
import {
  displayValue,
  formatDateTime,
  humanize,
  LEAD_STATUSES,
  statusStyles,
  unwrapData,
} from "./lead-utils";

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "unknown").toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        statusStyles[normalizedStatus] || "bg-muted text-muted-foreground",
      )}
    >
      {humanize(normalizedStatus)}
    </span>
  );
}

function Score({ value }) {
  const score = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className="min-w-20">
      <p className="text-xs font-semibold text-foreground">{score}/100</p>
      <span className="mt-2 block h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <span
          className={cn(
            "block h-full rounded-full",
            score >= 75
              ? "bg-emerald-500"
              : score >= 40
                ? "bg-amber-500"
                : "bg-slate-400",
          )}
          style={{ width: `${score}%` }}
        />
      </span>
    </div>
  );
}

function DetailItem({ icon, label, value, href }) {
  const DetailIcon = icon;
  const renderedValue = displayValue(value);

  return (
    <div className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70">
        <DetailIcon className="size-3.5 text-muted-foreground" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {href && value ? (
          <a
            className="mt-0.5 block break-words text-xs font-medium text-primary hover:underline"
            href={href}
          >
            {renderedValue}
          </a>
        ) : (
          <p className="mt-0.5 break-words text-xs font-medium">{renderedValue}</p>
        )}
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 sm:grid-cols-2">
      {[0, 1].map((column) => (
        <div key={column} className="space-y-5">
          <div className="h-3 w-28 rounded bg-muted" />
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex gap-3">
              <div className="size-8 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-2 w-16 rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function LeadDetailsDialog({ chatbotSlug, summary, initialView = "details", onClose }) {
  const leadId = summary?.id;
  const [draftStatus, setDraftStatus] = useState(summary?.status || "new");
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCapturedLeadDetailQuery(
    { chatbotSlug, leadId },
    { skip: !chatbotSlug || !leadId },
  );
  const [updateLead, { isLoading: isUpdating }] =
    useUpdateCapturedLeadMutation();
  const detailedLead = unwrapData(data);
  const lead = useMemo(
    () => ({ ...(summary || {}), ...(detailedLead || {}) }),
    [summary, detailedLead],
  );

  if (!summary) return null;

  const customFields = Object.entries(lead.custom_fields || {}).filter(
    ([key]) => key !== "company",
  );
  const location = [lead.detected_city, lead.detected_country_code]
    .filter(Boolean)
    .join(", ");
  const knownStatuses = LEAD_STATUSES.includes(draftStatus)
    ? LEAD_STATUSES
    : [draftStatus, ...LEAD_STATUSES];

  const changeStatus = async (nextStatus) => {
    const previousStatus = draftStatus;
    if (nextStatus === previousStatus) return;
    setDraftStatus(nextStatus);

    try {
      await updateLead({
        chatbotSlug,
        leadId,
        payload: { status: nextStatus },
      }).unwrap();
      toast.success(`Lead marked as ${humanize(nextStatus)}`);
    } catch (updateError) {
      setDraftStatus(previousStatus);
      toast.error(
        getApiErrorMessage(updateError, "Unable to update the lead status."),
      );
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-5xl">
        <DialogHeader className="border-b bg-muted/30 px-5 py-5 pr-14 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {getInitials(lead.name || lead.email || "Unknown lead")}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="truncate">{displayValue(lead.name)}</DialogTitle>
                  <StatusBadge status={draftStatus} />
                </div>
                <DialogDescription className="mt-1">
                  Captured {formatDateTime(lead.created_at)}
                </DialogDescription>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Status</span>
              <Select value={draftStatus} onValueChange={changeStatus} disabled={isUpdating}>
                <SelectTrigger className="h-9 w-36 rounded-xl bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {knownStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {humanize(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="custom-scrollbar min-h-0 overflow-y-auto">
          {isError && (
            <div className="mx-5 mt-5 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 sm:mx-6">
              <p>{getApiErrorMessage(error, "Live lead details could not be loaded. Showing the latest list data.")}</p>
              <Button size="sm" variant="outline" onClick={refetch}>
                <RefreshCw /> Retry
              </Button>
            </div>
          )}

          <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,1.1fr)]">
            <div className="border-b p-5 sm:p-6 lg:border-b-0 lg:border-r">
              {isLoading && !detailedLead ? (
                <DetailsSkeleton />
              ) : (
                <>
                  <div className={cn("grid gap-6 sm:grid-cols-2", isFetching && "opacity-75")}>
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Contact details
                      </h3>
                      <div className="mt-4 space-y-4">
                        <DetailItem
                          icon={Mail}
                          label="Email"
                          value={lead.email}
                          href={lead.email ? `mailto:${lead.email}` : undefined}
                        />
                        <DetailItem
                          icon={Phone}
                          label="Phone"
                          value={lead.phone}
                          href={lead.phone ? `tel:${lead.phone}` : undefined}
                        />
                        <DetailItem icon={MapPin} label="Address" value={lead.address} />
                        <DetailItem icon={Globe2} label="Detected location" value={location} />
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Lead information
                      </h3>
                      <div className="mt-4 space-y-4">
                        <DetailItem
                          icon={Building2}
                          label="Company"
                          value={lead.custom_fields?.company}
                        />
                        <DetailItem icon={Globe2} label="Source" value={humanize(lead.source)} />
                        <div className="flex gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70">
                            <ShieldCheck className="size-3.5 text-muted-foreground" />
                          </span>
                          <div className="pt-0.5">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Lead score
                            </p>
                            <div className="mt-1.5"><Score value={lead.lead_score} /></div>
                          </div>
                        </div>
                        <DetailItem
                          icon={CalendarClock}
                          label="Last updated"
                          value={formatDateTime(lead.updated_at)}
                        />
                      </div>
                    </section>
                  </div>

                  {customFields.length > 0 && (
                    <section className="mt-7 border-t pt-5">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Custom fields
                      </h3>
                      <dl className="mt-3 divide-y">
                        {customFields.map(([key, value]) => (
                          <div key={key} className="flex items-start justify-between gap-4 py-2.5 text-xs">
                            <dt className="text-muted-foreground">{humanize(key)}</dt>
                            <dd className="text-right font-semibold">{displayValue(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  )}

                  <section className="mt-7 rounded-2xl bg-muted/35 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Capture metadata
                    </h3>
                    <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">First IP</dt>
                        <dd className="mt-0.5 font-medium">{displayValue(lead.initial_ip_address)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Last IP</dt>
                        <dd className="mt-0.5 font-medium">{displayValue(lead.last_ip_address)}</dd>
                      </div>
                    </dl>
                  </section>
                </>
              )}
            </div>

            <aside
              className={cn(
                "bg-muted/[0.12] p-5 sm:p-6",
                initialView !== "details" && "order-first lg:order-none",
              )}
            >
              <LeadNotes
                key={`${leadId}-${initialView}`}
                chatbotSlug={chatbotSlug}
                leadId={leadId}
                startComposing={initialView === "add-note"}
              />
            </aside>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { Score, StatusBadge };
export default LeadDetailsDialog;
