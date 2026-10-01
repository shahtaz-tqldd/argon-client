import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { useInviteChatbotMemberMutation } from "@/features/chatbot/chatbotApiSlice";

import InviteChatbotMemberDialog from "../components/invite-member";
import MemberDetailsDialog from "../components/member-details";
import TeamMemberList from "../components/member-list";

const TeamMember = () => {
  const { chatbotSlug } = useParams();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inviteChatbotMember, { isLoading: isInviting }] =
    useInviteChatbotMemberMutation();

  const sendInvitation = async ({ email, permissions }) => {
    const response = await inviteChatbotMember({
      chatbotSlug,
      payload: { email, permissions },
    }).unwrap();
    toast.success(response?.message || `Invitation sent to ${email}`);
  };

  return (
    <>
      <TeamMemberList
        onSelectMember={setSelectedMember}
        onInvite={() => setInviteOpen(true)}
      />

      <InviteChatbotMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={sendInvitation}
        isLoading={isInviting}
      />
      <MemberDetailsDialog
        member={selectedMember}
        onOpenChange={(open) => !open && setSelectedMember(null)}
      />
    </>
  );
};

export default TeamMember;
