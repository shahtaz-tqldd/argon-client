import React from "react";
import { Text, Title } from "@/components/ui/typography";
import OverviewStats from "./components/stats";
import UserGrowth from "./components/user-growth";
import AIUsage from "./components/ai-usage";

const Overview = () => {
  return (
    <div>
      {/* Page Title */}
      <div>
        <Title variant="lg">Overview</Title>
        <Text className="mt-2">
          High-level summary of user growth, user activity, and important
          metrics.
        </Text>
      </div>
      <div className="space-y-5 mt-10">
        <OverviewStats />
        <div className="flex flex-wrap gap-5">
          <UserGrowth className="min-w-[min(100%,640px)] flex-[999_1_0]" />
          <AIUsage className="min-w-[min(100%,380px)] flex-1" />
        </div>
      </div>
    </div>
  );
};

export default Overview;
