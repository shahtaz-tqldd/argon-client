import { Settings2, TrendingUp, UserRoundSearch } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import Container from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section";
import TabMenu from "@/components/ui/tab";

import LeadAnalyticsTab from "./analytics";
import LeadCaptureConfig from "./config";
import LeadListTab from "./lead-list";

const pageTabs = [
  { value: "leads", label: "Collected leads", icon: UserRoundSearch },
  { value: "analysis", label: "Lead analysis", icon: TrendingUp },
  { value: "settings", label: "Settings", icon: Settings2 },
];

const DEFAULT_TAB = "leads";
const tabValues = new Set(pageTabs.map((tab) => tab.value));

const LeadCollectionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const activeTab = tabValues.has(tabFromUrl) ? tabFromUrl : DEFAULT_TAB;

  const changeTab = (tab) => {
    if (!tabValues.has(tab)) return;

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.set("tab", tab);
      return nextParams;
    });
  };

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
        setActiveTab={changeTab}
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
