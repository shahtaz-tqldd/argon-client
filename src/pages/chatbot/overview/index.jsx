import { ArrowLeft, Bot, CalendarDays, Settings } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

import ConnectedChannels from "./components/connected-channels";
import ConversationAnalytics from "./components/conversation-analytics";
import OngoingConversations from "./components/ongoing-conversations";
import OverviewStats from "./components/overview-stats";
import PlanUsage from "./components/plan-usage";
import UnansweredAlerts from "./components/unanswered-alerts";
import {
  analytics,
  chatbot,
  channels,
  conversations,
  kpiStats,
  plan,
  unansweredQuestions,
} from "./demo-data";
import Container from "@/components/ui/container";

const ChatbotOverviewPage = () => {
  return (
    <Container>
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Bot className="size-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {chatbot.name}
                </h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {chatbot.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">
            <CalendarDays /> Last 30 days
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-5">
        <OverviewStats stats={kpiStats} className="col-span-2" />
        <PlanUsage plan={plan} className="col-span-1" />
      </div>
      <div className="grid items-start gap-5 grid-cols-3">
        <UnansweredAlerts questions={unansweredQuestions} />
        <OngoingConversations conversations={conversations} />
        <ConnectedChannels channels={channels} />
      </div>
      <ConversationAnalytics analytics={analytics} />
    </Container>
  );
};

export default ChatbotOverviewPage;
