import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  KeyRound,
  Laptop2,
  Mail,
  MailPlus,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import InviteMemberDialog from "@/components/dialog/invite-member-dialog";
import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, getInitials } from "@/lib/utils";
import Container from "@/components/ui/container";

const initialPeople = [
  {
    id: "member-john",
    type: "member",
    name: "John Carter",
    email: "john.carter@atlas.co",
    role: "Admin",
    status: "Active",
    lastActive: "5 min ago",
    access: "Full permissions",
    joined: "March 18, 2026",
    device: "Chrome on macOS",
    avatarTone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    permissions: ["Manage chatbot", "Manage knowledge", "View conversations", "Reply to conversations", "Manage team", "View analytics"],
    activity: [
      ["Updated Atlas AI instructions", "Today · 10:18 AM"],
      ["Resolved conversation #4798", "Yesterday · 4:42 PM"],
      ["Invited Nadia Rahman", "Aug 18 · 9:14 AM"],
    ],
  },
  {
    id: "member-jane",
    type: "member",
    name: "Jane Cooper",
    email: "jane.cooper@atlas.co",
    role: "Agent",
    status: "Online",
    lastActive: "Now",
    access: "Support permissions",
    joined: "June 02, 2026",
    device: "Edge on Windows",
    avatarTone: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    permissions: ["View conversations", "Reply to conversations", "View customer details"],
    activity: [
      ["Took over conversation #4821", "Today · 10:44 AM"],
      ["Added an internal note", "Today · 9:28 AM"],
      ["Resolved conversation #4810", "Yesterday · 6:02 PM"],
    ],
  },
  {
    id: "member-shahtaz",
    type: "member",
    name: "Shahtaz",
    email: "shahtaz@atlas.co",
    role: "Owner",
    status: "Online",
    lastActive: "Now",
    access: "Owner access",
    joined: "January 10, 2026",
    device: "Chrome on Linux",
    avatarTone: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    permissions: ["Manage chatbot", "Manage knowledge", "View conversations", "Reply to conversations", "Manage team", "Manage billing", "View analytics"],
    activity: [
      ["Changed Nadia’s permissions", "Today · 8:36 AM"],
      ["Published chatbot changes", "Yesterday · 2:10 PM"],
      ["Connected WhatsApp channel", "Aug 17 · 11:46 AM"],
    ],
  },
  {
    id: "invite-priya",
    type: "invitation",
    name: "Pending invitation",
    email: "priya@atlas.co",
    role: "Agent",
    status: "Pending",
    lastActive: "Invited 2h ago",
    access: "Support permissions",
    invitedBy: "John Carter",
    expires: "Aug 27, 2026",
  },
  {
    id: "invite-omar",
    type: "invitation",
    name: "Pending invitation",
    email: "omar@atlas.co",
    role: "Viewer",
    status: "Pending",
    lastActive: "Invited yesterday",
    access: "Read-only access",
    invitedBy: "Shahtaz",
    expires: "Aug 26, 2026",
  },
];

const allPermissions = [
  "Manage chatbot",
  "Manage knowledge",
  "View conversations",
  "Reply to conversations",
  "View customer details",
  "Manage team",
  "Manage billing",
  "View analytics",
];

function MemberIdentity({ person }) {
  const isInvitation = person.type === "invitation";
  return (
    <div className="flex min-w-52 items-center gap-3">
      <div className="relative shrink-0">
        <span className={cn("flex size-10 items-center justify-center rounded-full text-xs font-bold", isInvitation ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : person.avatarTone)}>
          {isInvitation ? <Mail className="size-4" /> : getInitials(person.name)}
        </span>
        {person.status === "Online" && <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500" />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground">{person.name}</p>
          {person.role === "Owner" && <ShieldCheck className="size-3.5 text-primary" />}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{person.email}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    Owner: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    Admin: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    Agent: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    Viewer: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", styles[role])}>{role}</span>;
}

function StatusBadge({ status }) {
  const isOnline = status === "Online";
  const isPending = status === "Pending";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", isOnline ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : isPending ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-primary/10 text-primary")}>
      <span className={cn("size-1.5 rounded-full bg-current", isOnline && "animate-pulse")} />{status}
    </span>
  );
}

function AccessLabel({ person, onOpen }) {
  if (person.type === "invitation") {
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground">{person.access}</p>
        <p className="mt-0.5 text-[11px] text-amber-600 dark:text-amber-400">Awaiting acceptance</p>
      </div>
    );
  }
  return (
    <button onClick={() => onOpen(person)} className="group text-left">
      <span className="block text-xs font-semibold text-foreground transition group-hover:text-primary">{person.access}</span>
      <span className="mt-0.5 block text-[11px] text-muted-foreground">{person.permissions.length} permissions</span>
    </button>
  );
}

function MemberDetailRow({ icon, label, value }) {
  const DetailIcon = icon;
  return (
    <div className="flex gap-3">
      <DetailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-xs font-medium">{value}</p>
      </div>
    </div>
  );
}

function MemberDetailsDialog({ member, onOpenChange }) {
  if (!member) return null;
  return (
    <Dialog open={Boolean(member)} onOpenChange={onOpenChange}>
      <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-muted/30 px-6 py-6">
          <div className="flex items-center gap-4">
            <span className={cn("flex size-12 items-center justify-center rounded-full text-sm font-bold", member.avatarTone)}>{getInitials(member.name)}</span>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle>{member.name}</DialogTitle>
                <RoleBadge role={member.role} />
              </div>
              <DialogDescription className="mt-1">{member.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-0 md:grid-cols-[0.9fr_1.35fr]">
          <section className="border-b p-6 md:border-b-0 md:border-r">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Member details</p>
            <div className="mt-4 space-y-4">
              {[
                [Mail, "Email address", member.email],
                [UserRound, "Role", member.role],
                [CalendarDays, "Joined", member.joined],
                [Laptop2, "Last device", member.device],
              ].map(([icon, label, value]) => <MemberDetailRow key={label} icon={icon} label={label} value={value} />)}
            </div>
            <div className="mt-6 rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Current status</span>
                <StatusBadge status={member.status} />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Last active {member.lastActive.toLowerCase()}</p>
            </div>
          </section>

          <div>
            <section className="border-b p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Permissions</p>
                  <p className="mt-1 text-xs text-muted-foreground">Access granted through the {member.role} role.</p>
                </div>
                <KeyRound className="size-5 text-primary" />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {allPermissions.map((permission) => {
                  const enabled = member.permissions.includes(permission);
                  return (
                    <div key={permission} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs", enabled ? "border-primary/15 bg-primary/[0.04] font-medium" : "bg-muted/20 text-muted-foreground")}>
                      <Checkbox checked={enabled} disabled aria-label={`${permission}: ${enabled ? "allowed" : "not allowed"}`} />
                      <span>{permission}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="p-6">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Recent activity</p>
              </div>
              <div className="mt-4 space-y-4">
                {member.activity.map(([event, time], index) => (
                  <div key={event} className="relative flex gap-3">
                    {index < member.activity.length - 1 && <span className="absolute left-[7px] top-5 h-[calc(100%+4px)] w-px bg-border" />}
                    <span className="relative mt-1.5 size-3.5 shrink-0 rounded-full border-[3px] border-primary/20 bg-primary" />
                    <div>
                      <p className="text-xs font-medium">{event}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{time}</p>
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

const TeamMemberPage = () => {
  const [people, setPeople] = useState(initialPeople);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const members = people.filter((person) => person.type === "member");
  const invitations = people.filter((person) => person.type === "invitation");
  const seatLimit = 8;
  const seatPercentage = Math.round((members.length / seatLimit) * 100);

  const filteredPeople = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return people.filter((person) => {
      const matchesQuery = !normalizedQuery || `${person.name} ${person.email} ${person.role}`.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || person.status.toLowerCase() === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [people, query, statusFilter]);

  const rows = filteredPeople.map((person) => ({
    id: person.id,
    raw: person,
    member: <MemberIdentity person={person} />,
    role: <RoleBadge role={person.role} />,
    status: <StatusBadge status={person.status} />,
    lastActive: (
      <div>
        <p className="text-xs font-medium text-foreground">{person.lastActive}</p>
        {person.type === "member" && <p className="mt-0.5 text-[11px] text-muted-foreground">{person.status === "Online" ? "Currently online" : "Recent activity"}</p>}
      </div>
    ),
    access: <AccessLabel person={person} onOpen={setSelectedMember} />,
    action: "",
  }));
  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { header: "Member", accessorKey: "member" },
    { header: "Role", accessorKey: "role" },
    { header: "Status", accessorKey: "status" },
    { header: "Last active", accessorKey: "lastActive" },
    { header: "Access", accessorKey: "access" },
    { header: "", accessorKey: "action" },
  ];

  const sendInvitation = async (email) => {
    if (people.some((person) => person.email.toLowerCase() === email.toLowerCase())) {
      throw { data: { message: "This person is already a member or has a pending invitation." } };
    }
    setPeople((current) => [{ id: `invite-${Date.now()}`, type: "invitation", name: "Pending invitation", email, role: "Agent", status: "Pending", lastActive: "Invited just now", access: "Support permissions", invitedBy: "Shahtaz", expires: "Aug 27, 2026" }, ...current]);
    toast.success(`Invitation sent to ${email}`);
  };

  const removePerson = async (id) => {
    const person = people.find((item) => item.id === id);
    setPeople((current) => current.filter((item) => item.id !== id));
    if (selectedMember?.id === id) setSelectedMember(null);
    toast.success(person?.type === "invitation" ? "Invitation cancelled" : "Team member removed");
  };

  const tableOptions = [
    {
      label: "View details",
      hidden: (row) => row.raw.type === "invitation",
      action: (_, row) => setSelectedMember(row.raw),
    },
    {
      label: "Edit permissions",
      hidden: (row) => row.raw.type === "invitation",
      action: (_, row) => setSelectedMember(row.raw),
    },
    {
      label: "Resend invitation",
      hidden: (row) => row.raw.type !== "invitation",
      action: (_, row) => toast.success(`Invitation resent to ${row.raw.email}`),
    },
    {
      label: "Remove or cancel",
      type: "delete",
      hidden: (row) => row.raw.role === "Owner",
    },
  ];

  return (
    <Container>
      <header className="mt-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><UsersRound className="size-7" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Team members</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage who can access Atlas Support and what they can do.</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setInviteOpen(true)}><MailPlus />Invite member</Button>
      </header>

      <ReusableTable
        title="Members & invitations"
        description={`${members.length} active member${members.length === 1 ? "" : "s"} · ${invitations.length} pending invitation${invitations.length === 1 ? "" : "s"}`}
        headerActions={(
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 w-56 rounded-xl bg-slate-50 pl-9" placeholder="Search team" />
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36 rounded-xl bg-slate-50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        data={pagedRows}
        columns={columns}
        isLoading={false}
        totalItems={rows.length}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        table_options={tableOptions}
        onDeleteConfirm={removePerson}
        deleteLoading={false}
        emptyTitle="No team members found"
        emptyDescription="Try changing your search or status filter."
      />

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={sendInvitation}
        workspaceName="Atlas Support"
        title="Invite a team member"
        description="Invite someone to help manage conversations and support your customers."
        infoText="New members join with Support permissions. An admin can adjust access after they accept."
      />
      <MemberDetailsDialog member={selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)} />
    </Container>
  );
};

export default TeamMemberPage;
