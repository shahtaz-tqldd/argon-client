import { useState } from "react";
import { Clock3, MailPlus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import InviteMemberDialog from "@/components/dialog/invite-member-dialog";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  useInviteWorkspaceMemberMutation,
  useWorkspaceMemberListQuery,
} from "@/features/workspace/workspaceApiSlice";
import { cn, getInitials, toArray } from "@/lib/utils";

const isMemberOnline = (member, currentUserId) => {
  const person = member.user || member;
  return Boolean(
    member.is_online || member.online || person.id === currentUserId,
  );
};

const MemberAvatar = ({ member, isOnline }) => {
  const person = member.user || member;
  const name = person.name?.trim() || person.email;
  const avatar = person.avatar_url || person.avatar;

  return (
    <div className="relative shrink-0">
      <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary">
        {avatar ? (
          <img
            src={avatar}
            alt={`${name} avatar`}
            className="size-full object-cover"
          />
        ) : (
          getInitials(name)
        )}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500" />
      )}
    </div>
  );
};

const MemberRow = ({ member, currentUserId }) => {
  const person = member.user || member;
  const isOnline = isMemberOnline(member, currentUserId);
  const isActive = member.is_active !== false && person.is_active !== false;
  const role = member.role || (member.is_owner ? "Owner" : "Member");

  return (
    <div className="flex items-center gap-3 py-3">
      <MemberAvatar member={member} isOnline={isOnline} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {person.name?.trim() || person.email}
          </p>
          {String(role).toLowerCase() === "owner" && (
            <ShieldCheck className="size-3.5 shrink-0 text-primary" />
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{person.email}</p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "text-xs font-semibold",
            isOnline
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground",
          )}
        >
          {isOnline ? "Online" : isActive ? "Active" : "Inactive"}
        </p>
        <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">
          {role}
        </p>
      </div>
    </div>
  );
};

const PendingInvitationRow = ({ invitation }) => {
  const person = invitation.user || invitation;
  const email = person.email || invitation.email;
  const name = person.name?.trim();

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <Clock3 className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {name || email || "Invited member"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {name && email ? email : "Invitation sent"}
        </p>
      </div>
      <div className="text-right">
        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          Pending
        </span>
        <p className="mt-1 text-[11px] capitalize text-muted-foreground">
          {invitation.role || "Member"}
        </p>
      </div>
    </div>
  );
};

const getMembers = (workspace, currentUser) => {
  const members = toArray(workspace.members || workspace.memberships);
  if (members.length || !workspace.owner) return members;

  const isCurrentUser = workspace.owner.id === currentUser?.id;
  return [
    {
      ...workspace.owner,
      avatar_url: isCurrentUser
        ? currentUser?.avatar_url
        : workspace.owner.avatar_url,
      role: "owner",
      is_owner: true,
      is_active: true,
      is_online: isCurrentUser,
    },
  ];
};

const getMemberList = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) return payload;

  return toArray(payload?.results || payload?.members || payload?.memberships);
};

const isPendingInvitation = (member) =>
  member.invitation_request_accepted === false;

const getInvitationEmail = (invitation) =>
  invitation.user?.email || invitation.email;

const getPendingInvitations = (workspace, teamInvitations, sentInvitations) => {
  const apiInvitations = toArray(
    workspace.pending_invitations || workspace.invitations,
  ).filter(
    (invitation) =>
      invitation.invitation_request_accepted === false ||
      (!("invitation_request_accepted" in invitation) &&
        !invitation.accepted_at),
  );

  return [...sentInvitations, ...teamInvitations, ...apiInvitations].filter(
    (invitation, index, invitations) =>
      invitations.findIndex((item) => {
        const hasMatchingId = invitation.id && item.id === invitation.id;
        const invitationEmail = getInvitationEmail(invitation)?.toLowerCase();
        const hasMatchingEmail =
          invitationEmail &&
          getInvitationEmail(item)?.toLowerCase() === invitationEmail;
        return hasMatchingId || hasMatchingEmail;
      }) === index,
  );
};

const WorkspaceTeam = ({ workspace, currentUser, onWorkspaceChange }) => {
  const { data: memberResponse } = useWorkspaceMemberListQuery({
    workspaceSlug: workspace?.slug,
  });
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [inviteWorkspaceMember, { isLoading: isInviting }] =
    useInviteWorkspaceMemberMutation();

  const apiMembers = getMemberList(memberResponse);
  const teamRecords =
    memberResponse === undefined
      ? getMembers(workspace, currentUser)
      : apiMembers;
  const members = teamRecords.filter((member) => !isPendingInvitation(member));
  const pendingInvitations = getPendingInvitations(
    workspace,
    teamRecords.filter(isPendingInvitation),
    sentInvitations,
  );
  const workspaceMemberCount =
    Number(workspace.member_count ?? members.length) || 0;
  const memberCount =
    memberResponse === undefined
      ? Math.max(workspaceMemberCount, members.length)
      : members.length;

  const sendInvitation = async (email) => {
    const response = await inviteWorkspaceMember({
      workspaceSlug: workspace.slug,
      email,
    }).unwrap();
    const invitation = response?.data || { email };

    setSentInvitations((current) => [invitation, ...current]);
    toast.success(`Invitation sent to ${invitation.email || email}`);

    try {
      await onWorkspaceChange?.();
    } catch {
      // The invitation succeeded even if refreshing the workspace did not.
    }
  };

  return (
    <>
      <Card className="p-0">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-bold text-foreground">Members</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {memberCount} member{memberCount === 1 ? "" : "s"}
              {pendingInvitations.length > 0 &&
                ` · ${pendingInvitations.length} pending`}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsInviteDialogOpen(true)}
          >
            <MailPlus /> Invite member
          </Button>
        </div>

        <div className="divide-y divide-border px-5">
          {members.map((member) => (
            <MemberRow
              key={member.id || member.user?.id || member.email}
              member={member}
              currentUserId={currentUser?.id}
            />
          ))}
          {pendingInvitations.map((invitation) => (
            <PendingInvitationRow
              key={invitation.id || invitation.email}
              invitation={invitation}
            />
          ))}
        </div>

        {memberCount > members.length && (
          <p className="border-t border-border px-5 py-3 text-center text-xs text-muted-foreground">
            {memberCount - members.length} more member
            {memberCount - members.length === 1 ? "" : "s"} in this workspace
          </p>
        )}
      </Card>

      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onInvite={sendInvitation}
        isLoading={isInviting}
        workspaceName={workspace.name}
      />
    </>
  );
};

export default WorkspaceTeam;
