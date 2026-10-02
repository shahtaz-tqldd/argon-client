import { UserIdentity } from "@/components/shared/user-profile";
import { StatusBadge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import {
  Facebook,
  Globe2,
  Instagram,
  MessageCircleMore,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import ReusableTable from "@/components/table";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import moment from "moment";
import DetailsDialog from "./details";
import AppointmentStats from "./stats";
import {
  useAppointmentListQuery,
  useUpdateAppointmentMutation,
} from "@/features/appointment/appointmentApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";

const capitalize = (value) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "Pending";

const mapAppointment = (item) => {
  const fields = item?.collected_fields ?? {};
  const metadata = item?.metadata ?? {};
  const start = moment(item?.starts_at);
  const end = moment(item?.ends_at);
  const durationMinutes =
    end.isValid() && start.isValid()
      ? Math.max(0, end.diff(start, "minutes"))
      : 0;

  return {
    id: item?.id,
    name: fields.name || "Unknown guest",
    email: fields.email || "Not collected",
    phone: fields.phone || "Not collected",
    company: fields.company || metadata.company || "Not collected",
    title: metadata.title || "Chatbot booking",
    date: start.isValid() ? start.format("MMM D, YYYY") : "—",
    time: start.isValid() ? start.format("h:mm A") : "—",
    timezone: start.isValid() ? `UTC${start.format("Z")}` : "",
    duration: `${durationMinutes} min`,
    host: metadata.host || "Chatbot agent",
    source: metadata.source || "Website",
    status: capitalize(item?.status),
    location: metadata.location || "Google Meet",
    notes: item?.notes || "No booking context captured.",
    booked: moment(item?.created_at).isValid()
      ? moment(item?.created_at).format("MMM D · h:mm A")
      : "—",
  };
};

const AppointmentListTab = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedId, setSelectedId] = useState(null);

  const { chatbotSlug } = useCurrentChatbot();
  const { data, isLoading, isFetching } = useAppointmentListQuery(
    { chatbotSlug, page, pageSize },
    { skip: !chatbotSlug },
  );
  const [updateAppointment] = useUpdateAppointmentMutation();

  const appointments = useMemo(
    () => (Array.isArray(data?.data) ? data.data : []).map(mapAppointment),
    [data],
  );

  const totalCount = data?.meta?.count ?? appointments.length;

  const selected = useMemo(
    () => appointments.find((item) => item.id === selectedId) ?? null,
    [appointments, selectedId],
  );

  const updateStatus = async (id, nextStatus) => {
    try {
      await updateAppointment({
        chatbotSlug,
        appointmentId: id,
        payload: { status: nextStatus.toLowerCase() },
      }).unwrap();
      toast.success(`Appointment marked ${nextStatus.toLowerCase()}`);
    } catch {
      toast.error("Failed to update appointment");
    }
  };

  const hasActiveFilter = query.trim() !== "" || status !== "all";
  const visible = useMemo(
    () =>
      appointments.filter(
        (item) =>
          `${item.name} ${item.email} ${item.company} ${item.title}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "all" || item.status.toLowerCase() === status),
      ),
    [appointments, query, status],
  );
  const rows = visible.map((item) => ({
    id: item.id,
    raw: item,
    guest: <UserIdentity name={item.name} email={item.email} />,
    schedule: (
      <div className="min-w-36">
        <p className="text-xs font-semibold text-foreground">{item.date}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {item.time} · {item.timezone}
        </p>
      </div>
    ),
    appointmentType: (
      <div>
        <p className="text-xs font-semibold text-foreground">{item.title}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {item.duration}
        </p>
      </div>
    ),
    host: (
      <div>
        <p className="text-xs font-medium text-foreground">{item.host}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <ChannelIcon source={item.source} />
          <span className="text-[11px] text-muted-foreground">
            {item.source}
          </span>
        </div>
      </div>
    ),
    appointmentStatus: <StatusBadge>{item.status}</StatusBadge>,
    booked: (
      <div>
        <p className="text-xs font-medium text-foreground">{item.booked}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {item.location}
        </p>
      </div>
    ),
    action: "",
  }));
  return (
    <div className="space-y-5">
      <AppointmentStats />
      <ReusableTable
        title="Booked appointments"
        description={`${
          hasActiveFilter ? visible.length : totalCount
        } matching appointments · Times shown in visitor timezone`}
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className="h-9 w-56 rounded-xl bg-slate-50 pl-9"
                placeholder="Search appointments"
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
                {["Confirmed", "Pending", "Completed", "Cancelled"].map(
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
          { header: "Guest", accessorKey: "guest" },
          { header: "Date & time", accessorKey: "schedule" },
          { header: "Appointment", accessorKey: "appointmentType" },
          { header: "Host & source", accessorKey: "host" },
          { header: "Status", accessorKey: "appointmentStatus" },
          { header: "Booked", accessorKey: "booked" },
          { header: "", accessorKey: "action" },
        ]}
        isLoading={isLoading || isFetching}
        totalItems={hasActiveFilter ? visible.length : totalCount}
        page={hasActiveFilter ? 1 : page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        table_options={[
          {
            label: "View details",
            action: (_, row) => setSelectedId(row.raw.id),
          },
          {
            label: "Reschedule",
            action: (_, row) =>
              toast.success(`Reschedule link opened for ${row.raw.name}`),
          },
          {
            label: "Mark completed",
            hidden: (row) =>
              ["Completed", "Cancelled"].includes(row.raw.status),
            action: (_, row) => updateStatus(row.id, "Completed"),
          },
          {
            label: "Cancel appointment",
            hidden: (row) => row.raw.status === "Cancelled",
            action: (_, row) => updateStatus(row.id, "Cancelled"),
          },
        ]}
        onDeleteConfirm={async () => {}}
        deleteLoading={false}
        emptyTitle="No appointments found"
        emptyDescription="Try changing your search or status filter."
      />

      <DetailsDialog
        appointment={selected}
        onClose={() => setSelectedId(null)}
        onStatusChange={updateStatus}
      />
    </div>
  );
};

function ChannelIcon({ source }) {
  const channelMeta = {
    Website: { icon: Globe2, tone: "bg-sky-500/10 text-sky-600" },
    WhatsApp: {
      icon: MessageCircleMore,
      tone: "bg-emerald-500/10 text-emerald-600",
    },
    Instagram: { icon: Instagram, tone: "bg-fuchsia-500/10 text-fuchsia-600" },
    Facebook: { icon: Facebook, tone: "bg-blue-600/10 text-blue-600" },
  };

  const meta = channelMeta[source] || channelMeta.Website;
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-full",
        meta.tone,
      )}
    >
      <Icon className="size-3" />
    </span>
  );
}

export default AppointmentListTab;
