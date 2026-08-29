import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import Container from "@/components/ui/container";
import InviteChatbotMemberDialog from "./components/invite-member";
import MemberDetailsDialog from "./components/member-details";
import { SectionTitle } from "@/components/ui/section";
import TeamMemberList from "./components/member-list";

import { useChatbotTitle } from "@/hooks/useTitle";
import { useInviteChatbotMemberMutation } from "@/features/chatbot/chatbotApiSlice";
import { UsersRound } from "lucide-react";

const TeamMemberPage = () => {
  useChatbotTitle("Team");
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
    <Container>
      <SectionTitle
        icon={UsersRound}
        title="Team members"
        details="Manage who can access Atlas Support and what they can do."
        lg
      />
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
    </Container>
  );
};

export default TeamMemberPage;
