import { AlertCircle, Bell, ChevronRight } from "lucide-react";

import Card from "@/components/ui/card";

const UnansweredAlerts = ({ questions }) => {
  const unreadCount = questions.filter(({ unread }) => unread).length;

  return (
    <Card className="p-0">
      <div className="flex items-start justify-between gap-4 border-b border-border bg-amber-500/[0.04] p-5">
        <div className="flex items-center gap-3">
          <span className="relative flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card bg-red-500" />
            )}
          </span>
          <div>
            <h2 className="font-bold text-foreground">Needs your attention</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Questions AI couldn’t answer</p>
          </div>
        </div>
        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400">
          {unreadCount} unread
        </span>
      </div>

      <ul className="divide-y divide-border">
        {questions.map((question) => (
          <li key={question.id}>
            <button
              type="button"
              className="group flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-muted/30"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-medium leading-5 text-foreground">
                  {question.question}
                </span>
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {question.source} · {question.time}
                </span>
              </span>
              {question.unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default UnansweredAlerts;
