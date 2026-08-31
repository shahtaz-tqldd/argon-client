import { Settings2, TrendingUp, UserRoundSearch } from "lucide-react";

import Container from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section";
import TabMenu from "@/components/ui/tab";
import useUrlTab from "@/hooks/useUrlTab";

import LeadAnalyticsTab from "./analytics";
import LeadCaptureConfig from "./config";
import LeadListTab from "./lead-list";

const pageTabs = [
  { value: "leads", label: "Collected leads", icon: UserRoundSearch },
  { value: "analysis", label: "Lead analysis", icon: TrendingUp },
  { value: "settings", label: "Settings", icon: Settings2 },
];

const DEFAULT_TAB = "leads";

const LeadCollectionPage = () => {
  const [activeTab, setActiveTab] = useUrlTab({
    tabs: pageTabs,
    defaultTab: DEFAULT_TAB,
  });

  return (
    <Container>
      <SectionTitle
        icon={UserRoundSearch}
        title="Lead Collections"
        details="Capture, qualify, and route high-intent visitors from every channel."
        lg
      />

      <TabMenu
        tabs={pageTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollable
        className="w-fit bg-background/95 backdrop-blur"
      />

      {activeTab === "leads" && <LeadListTab />}
      {activeTab === "analysis" && <LeadAnalyticsTab />}
      {activeTab === "settings" && <LeadCaptureConfig />}
    </Container>
  );
};

export default LeadCollectionPage;
