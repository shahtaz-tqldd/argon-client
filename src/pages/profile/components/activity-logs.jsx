import Card from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, Clock3, MonitorSmartphone } from "lucide-react";

const ACTIVITY_LOGS = [
  {
    id: 1,
    action: "Signed in to admin portal",
    area: "Authentication",
    device: "Chrome on Linux",
    location: "Dhaka, Bangladesh",
    ip: "103.120.88.24",
    timestamp: "August 6, 2026 · 9:42 AM",
    result: "Success",
  },
  {
    id: 2,
    action: "Updated Bali destination",
    area: "Destinations",
    device: "Chrome on Linux",
    location: "Dhaka, Bangladesh",
    ip: "103.120.88.24",
    timestamp: "August 5, 2026 · 8:18 PM",
    result: "Success",
  },
  {
    id: 3,
    action: "Published privacy policy",
    area: "Platform content",
    device: "Chrome on Linux",
    location: "Dhaka, Bangladesh",
    ip: "103.120.88.24",
    timestamp: "August 4, 2026 · 3:06 PM",
    result: "Success",
  },
  {
    id: 4,
    action: "Password change attempted",
    area: "Security",
    device: "Safari on iPhone",
    location: "Dhaka, Bangladesh",
    ip: "103.120.91.17",
    timestamp: "August 2, 2026 · 11:31 AM",
    result: "Blocked",
  },
  {
    id: 5,
    action: "Exported destination template",
    area: "Destinations",
    device: "Chrome on Linux",
    location: "Dhaka, Bangladesh",
    ip: "103.120.88.24",
    timestamp: "July 31, 2026 · 6:54 PM",
    result: "Success",
  },
];

const ActivityLogs = () => {
  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Administrative activity
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            A demo audit trail of security and content-management actions.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <Clock3 className="h-3.5 w-3.5" /> Last 30 days
        </div>
      </div>

      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Activity
            </TableHead>
            <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Device & location
            </TableHead>
            <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              IP address
            </TableHead>
            <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Date & time
            </TableHead>
            <TableHead className="h-12 px-5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Result
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ACTIVITY_LOGS.map((log) => (
            <TableRow
              key={log.id}
              className="border-slate-100 hover:bg-primary/[0.03]"
            >
              <TableCell className="px-5 py-4">
                <div className="flex min-w-[220px] items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{log.action}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{log.area}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-5 py-4">
                <div className="flex min-w-[180px] items-start gap-2">
                  <MonitorSmartphone className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {log.device}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {log.location}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-5 py-4 font-mono text-xs text-slate-500">
                {log.ip}
              </TableCell>
              <TableCell className="px-5 py-4 text-sm text-slate-600">
                <span className="inline-block min-w-[190px]">
                  {log.timestamp}
                </span>
              </TableCell>
              <TableCell className="px-5 py-4 text-right">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    log.result === "Success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {log.result}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 text-xs text-slate-500">
        Demo data · Connect this table to the audit-log endpoint when available.
      </div>
    </Card>
  );
};

export default ActivityLogs;
