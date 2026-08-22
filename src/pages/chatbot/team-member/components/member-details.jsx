import {
  Activity,
  CalendarDays,
  KeyRound,
  LogIn,
  Mail,
  UserRound,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, getInitials } from "@/lib/utils";

const permissionOptions = [
  {
    label: "Chat Session",
    values: ["chat_session", "chat_session_management"],
  },
  { label: "Lead Management", values: ["lead_management"] },
  {
    label: "Appointment Management",
    values: ["appointment_management"],
  },
  {
    label: "Setup and Configuration",
    values: ["setup_config", "setup_configuration"],
  },
];

function RoleBadge({ role }) {
  const styles = {
    Owner: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    Admin: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    Member: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[role] || "bg-slate-500/10 text-slate-600 dark:text-slate-300",
      )}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "Active";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isActive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function MemberDetailRow({ icon, label, value }) {
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

const MemberDetailsDialog = ({ member, onOpenChange }) => {
  if (!member) return null;

  return (
    <Dialog open={Boolean(member)} onOpenChange={onOpenChange}>
      <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-muted/30 px-6 py-6">
          <div className="flex items-center gap-4">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt=""
                className="size-12 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {getInitials(member.name || member.email)}
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle>{member.name}</DialogTitle>
                <RoleBadge role={member.role} />
              </div>
              <DialogDescription className="mt-1">
                {member.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-0 md:grid-cols-[0.9fr_1.35fr]">
          <section className="border-b p-6 md:border-b-0 md:border-r">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Member details
            </p>
            <div className="mt-4 space-y-4">
              {[
                [Mail, "Email address", member.email],
                [UserRound, "Role", member.role],
                [CalendarDays, "Joined", member.joined],
                [LogIn, "Last login", member.lastLogin],
              ].map(([icon, label, value]) => (
                <MemberDetailRow
                  key={label}
                  icon={icon}
                  label={label}
                  value={value}
                />
              ))}
            </div>
            <div className="mt-6 rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Current status</span>
                <StatusBadge status={member.status} />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {member.lastActive}
              </p>
            </div>
          </section>

          <div>
            <section className="border-b p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Permissions
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {member.all_permissions
                      ? "This member has access to every chatbot area."
                      : `Access granted through the ${member.role} role.`}
                  </p>
                </div>
                <KeyRound className="size-5 text-primary" />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {permissionOptions.map((permission) => {
                  const enabled =
                    member.all_permissions ||
                    permission.values.some((value) =>
                      member.permissions.includes(value),
                    );

                  return (
                    <div
                      key={permission.label}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs",
                        enabled
                          ? "border-primary/15 bg-primary/[0.04] font-medium"
                          : "bg-muted/20 text-muted-foreground",
                      )}
                    >
                      <Checkbox
                        checked={enabled}
                        disabled
                        aria-label={`${permission.label}: ${enabled ? "allowed" : "not allowed"}`}
                      />
                      <span>{permission.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="p-6">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Account activity
                </p>
              </div>
              <div className="mt-4 space-y-4">
                {member.activity.map(([event, time], index) => (
                  <div key={event} className="relative flex gap-3">
                    {index < member.activity.length - 1 && (
                      <span className="absolute left-[7px] top-5 h-[calc(100%+4px)] w-px bg-border" />
                    )}
                    <span className="relative mt-1.5 size-3.5 shrink-0 rounded-full border-[3px] border-primary/20 bg-primary" />
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
};

export default MemberDetailsDialog;
