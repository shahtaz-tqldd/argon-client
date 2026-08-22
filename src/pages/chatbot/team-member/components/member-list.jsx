import { useMemo, useState } from "react";
import { MailPlus } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { UserProfile } from "@/components/ui/section";
import {
  useChatbotMemberListQuery,
  useRemoveChatbotMemberMutation,
} from "@/features/chatbot/chatbotApiSlice";
import { duration, formatDate, formatDateTime } from "@/lib/date-time";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

const normalizeMember = (member) => {
  const email = member.user?.email || "";
  const isPending = !member.is_active;
  const permissions = Array.isArray(member.permissions)
    ? member.permissions
    : [];
  const activity = [
    member.last_active && ["Last active", formatDateTime(member.last_active)],
    member.last_login && ["Last login", formatDateTime(member.last_login)],
    member.invited_at && [
      "Invited to chatbot",
      formatDateTime(member.invited_at),
    ],
  ].filter(Boolean);

  return {
    ...member,
    type: isPending ? "invitation" : "member",
    name:
      member.user?.name?.trim() ||
      (isPending ? "Pending invitation" : email.split("@")[0]),
    email,
    avatar: member.user?.avatar || "",
    role: member?.role,
    status: isPending ? "Pending" : "Active",
    lastActive: member.last_active
      ? duration(member.last_active)
      : member.invited_at
        ? `Invited ${duration(member.invited_at)}`
        : "Never active",
    access: member.all_permissions
      ? "All permissions"
      : `${permissions.length} permission${permissions.length === 1 ? "" : "s"}`,
    permissions,
    joined: formatDate(member.created_at),
    lastLogin: formatDateTime(member.last_login),
    activity,
  };
};

function AccessLabel({ person, onOpen }) {
  if (person.type === "invitation") {
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground">
          {person.access}
        </p>
        <p className="mt-0.5 text-[11px] text-amber-600 dark:text-amber-400">
          Awaiting acceptance
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(person)}
      className="group text-left"
    >
      <span className="block text-xs font-semibold text-foreground transition group-hover:text-primary">
        {person.access}
      </span>
      <span className="mt-0.5 block text-[11px] text-muted-foreground">
        {person.all_permissions
          ? "Full chatbot access"
          : `${person.permissions.length} selected`}
      </span>
    </button>
  );
}

const TEAM_MEMBER_LIMIT = 5;

const TeamMemberProgress = ({ active, pending, isLoading }) => {
  const occupied = active + pending;
  const activeWidth = Math.min(active, TEAM_MEMBER_LIMIT) / TEAM_MEMBER_LIMIT;
  const pendingWidth =
    Math.min(pending, Math.max(TEAM_MEMBER_LIMIT - active, 0)) /
    TEAM_MEMBER_LIMIT;

  if (isLoading) {
    return (
      <div className="h-12 w-full max-w-72 animate-pulse rounded-xl bg-muted sm:w-72" />
    );
  }

  return (
    <div className="w-56 text-xs">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-semibold text-foreground">
          {occupied}/{TEAM_MEMBER_LIMIT} team members
        </span>
        <span className="text-[11px] text-muted-foreground">
          {active} active · {pending} pending
        </span>
      </div>
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${active} active and ${pending} pending out of ${TEAM_MEMBER_LIMIT} team members`}
      >
        <span
          className="h-full bg-emerald-500 transition-[width]"
          style={{ width: `${activeWidth * 100}%` }}
        />
        <span
          className="h-full bg-amber-400 transition-[width]"
          style={{ width: `${pendingWidth * 100}%` }}
        />
      </div>
    </div>
  );
};

const TeamMemberList = ({
  onSelectMember,
  onInvite,
}) => {
  const { chatbotSlug } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isFetching, isError, error } =
    useChatbotMemberListQuery({ chatbotSlug, page, pageSize });
  const [removeChatbotMember, { isLoading: isRemoving }] =
    useRemoveChatbotMemberMutation();

  const people = useMemo(
    () => (Array.isArray(data?.data) ? data.data.map(normalizeMember) : []),
    [data],
  );

  const activeCount = people.filter((person) => person.is_active).length;
  const pendingCount = people.length - activeCount;

  const rows = people.map((person) => ({
    id: person.id,
    raw: person,
    member: <UserProfile person={person} />,
    role: <Badge>{person?.role}</Badge>,
    status: <StatusBadge>{person.status}</StatusBadge>,
    lastActive: (
      <div>
        <p className="text-xs font-medium text-foreground">
          {person.lastActive}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {person.is_active ? "Member activity" : "Invitation sent"}
        </p>
      </div>
    ),
    access: <AccessLabel person={person} onOpen={onSelectMember} />,
    action: "",
  }));
  const removePerson = async (id) => {
    const person = people.find((item) => item.id === id);
    if (!person) return;

    await removeChatbotMember({
      chatbotSlug,
      memberEmail: person.email,
    }).unwrap();
    onSelectMember?.(null);
    toast.success(
      person.type === "invitation"
        ? "Invitation cancelled"
        : "Team member removed",
    );
  };

  const tableOptions = [
    {
      label: "View details",
      hidden: (row) => row.raw.type === "invitation",
      action: (_, row) => onSelectMember?.(row.raw),
    },
    {
      label: "Remove or cancel",
      type: "delete",
      hidden: (row) => row.raw.role === "Owner",
    },
  ];

  return (
    <ReusableTable
      title="Members & invitations"
      description={`${activeCount} active member${activeCount === 1 ? "" : "s"} · ${pendingCount} pending invitation${pendingCount === 1 ? "" : "s"}`}
      headerActions={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <TeamMemberProgress
            active={activeCount}
            pending={pendingCount}
            isLoading={isLoading || isFetching}
          />
          <Button onClick={onInvite}>
            <MailPlus />
            Invite member
          </Button>
        </div>
      }
      data={rows}
      columns={[
        { header: "Member", accessorKey: "member" },
        { header: "Role", accessorKey: "role" },
        { header: "Status", accessorKey: "status" },
        { header: "Last active", accessorKey: "lastActive" },
        { header: "Access", accessorKey: "access" },
        { header: "", accessorKey: "action" },
      ]}
      isLoading={isLoading || isFetching}
      totalItems={data?.meta?.count ?? people.length}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      table_options={tableOptions}
      onDeleteConfirm={removePerson}
      deleteLoading={isRemoving}
      emptyTitle={
        isError ? "Unable to load team members" : "No team members found"
      }
      emptyDescription={
        isError
          ? getApiErrorMessage(error, "Please try again later.")
          : "Try changing your search or status filter."
      }
    />
  );
};

export default TeamMemberList;
