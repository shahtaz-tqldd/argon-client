import { ArrowLeft, Bot, CalendarDays, Settings } from "lucide-react";
import { Link } from "react-router-dom";

import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import ConnectedChannels from "./components/connected-channels";
import ConversationAnalytics from "./components/conversation-analytics";
import LeadsCaptured from "./components/leads-captured";
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
  leadSummary,
  plan,
  unansweredQuestions,
} from "./demo-data";

const ChatbotOverviewPage = () => {
  return (
    <section className="mx-auto max-w-7xl space-y-6 pb-8">
      <header className="flex flex-col gap-5 pr-14 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to workspace
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Bot className="size-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {chatbot.name}
                </h1>
                <StatusBadge>{chatbot.status}</StatusBadge>
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
          <Button>
            <Settings /> Configure chatbot
          </Button>
        </div>
      </header>

      <OverviewStats stats={kpiStats} />

      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.75fr)]">
        <PlanUsage plan={plan} />
        <LeadsCaptured leads={leadSummary} />
      </div>

      <ConversationAnalytics analytics={analytics} />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <OngoingConversations conversations={conversations} />
        <aside className="space-y-5">
          <ConnectedChannels channels={channels} />
          <UnansweredAlerts questions={unansweredQuestions} />
        </aside>
      </div>
    </section>
  );
};

export default ChatbotOverviewPage;
