import { Activity, UsersRound } from "lucide-react";

import Container from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section";
import TabMenu from "@/components/ui/tab";
import useUrlTab from "@/hooks/useUrlTab";
import { useChatbotTitle } from "@/hooks/useTitle";

import ActivityList from "./activity";
import TeamMember from "./team";

const pageTabs = [
  { value: "team", label: "Team Member", icon: UsersRound },
  { value: "activity", label: "Activity", icon: Activity },
];

const TeamActivityPage = () => {
  useChatbotTitle("Team & Activity");
  const [activeTab, setActiveTab] = useUrlTab({
    tabs: pageTabs,
    defaultTab: "team",
  });

  return (
    <Container>
      <SectionTitle
        icon={UsersRound}
        title="Team & Activity"
        details="Manage who can access Atlas Support and what they can do."
        lg
      />

      <TabMenu
        tabs={pageTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollable
        className="w-fit"
      />

      {activeTab === "team" && <TeamMember />}
      {activeTab === "activity" && <ActivityList />}
    </Container>
  );
};

export default TeamActivityPage;
