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
import { initialAppointments } from "../demo-data";
import DetailsDialog from "./details";
import AppointmentStats from "./stats";
import { useAppointmentListQuery } from "@/features/appointment-booking/appointmentBookingApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";

const AppointmentListTab = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { chatbotSlug } = useCurrentChatbot();
  const { data } = useAppointmentListQuery({ chatbotSlug });
  console.log(data);

  const [appointments, setAppointments] = useState(initialAppointments);

  const [selected, setSelected] = useState(null);
  const updateStatus = (id, status) => {
    setAppointments((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setSelected((current) =>
      current?.id === id ? { ...current, status } : current,
    );
    toast.success(`Appointment marked ${status.toLowerCase()}`);
  };

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
  const rows = visible
    .slice((page - 1) * pageSize, page * pageSize)
    .map((item) => ({
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
  const update = (id, nextStatus) => {
    setAppointments((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item,
      ),
    );
    toast.success(`Appointment marked ${nextStatus.toLowerCase()}`);
  };
  return (
    <div className="space-y-5">
      <AppointmentStats />
      <ReusableTable
        title="Booked appointments"
        description={`${visible.length} matching appointments · Times shown in visitor timezone`}
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
        isLoading={false}
        totalItems={visible.length}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        table_options={[
          {
            label: "View details",
            action: (_, row) => setSelected(row.raw),
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
            action: (_, row) => update(row.id, "Completed"),
          },
          {
            label: "Cancel appointment",
            hidden: (row) => row.raw.status === "Cancelled",
            action: (_, row) => update(row.id, "Cancelled"),
          },
        ]}
        onDeleteConfirm={async () => {}}
        deleteLoading={false}
        emptyTitle="No appointments found"
        emptyDescription="Try changing your search or status filter."
      />

      <DetailsDialog
        appointment={selected}
        onClose={() => setSelected(null)}
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
