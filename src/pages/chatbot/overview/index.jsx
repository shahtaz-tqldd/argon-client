import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import ConnectedChannels from "./components/connected-channels";
import Container from "@/components/ui/container";
import ConversationAnalytics from "./components/conversation-analytics";
import OngoingConversations from "./components/ongoing-conversations";
import OverviewStats from "./components/overview-stats";
import PlanUsage from "./components/plan-usage";
import UnansweredAlerts from "./components/unanswered-alerts";

import { CalendarDays, Sparkles } from "lucide-react";
import {
  analytics,
  chatbot,
  channels,
  conversations,
  kpiStats,
  plan,
  unansweredQuestions,
} from "./demo-data";
import { useSelector } from "react-redux";
import { useChatbotTitle } from "@/hooks/useTitle";

const ChatbotOverviewPage = () => {
  const { user } = useSelector((state) => state?.auth);

  // page title
  useChatbotTitle("Overview");

  return (
    <Container>
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="flx gap-2 font-semibold text-primary">
            <Sparkles size={14} />
            Good Eveining!
          </p>
          <h1 className="mt-3.5 text-2xl font-semibold text-foreground md:text-3xl">
            Hey {user?.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome to {chatbot.chatbot_name} management platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">
            <CalendarDays /> Last 30 days
          </Button>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <OverviewStats stats={kpiStats} />
          <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
            <UnansweredAlerts questions={unansweredQuestions} />
            <OngoingConversations conversations={conversations} />
          </div>
        </div>
        <Card className="col-span-1 h-fit p-0">
          <PlanUsage plan={plan} />
          <ConnectedChannels channels={channels} />
        </Card>
      </div>
      <ConversationAnalytics analytics={analytics} />
    </Container>
  );
};

export default ChatbotOverviewPage;
