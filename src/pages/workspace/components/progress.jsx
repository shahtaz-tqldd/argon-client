import { CheckCircle2, Wifi } from "lucide-react";

import Card from "@/components/ui/card";
import { cn, toArray } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/section";

const WorkspaceProgress = ({ workspace }) => {
  const members = toArray(workspace.members || workspace.memberships);
  const invitations = toArray(
    workspace.pending_invitations || workspace.invitations,
  ).filter((invitation) => !invitation.accepted_at);
  const memberCount = workspace.member_count ?? members.length;

  const setupSteps = [
    { label: "Name your workspace", isComplete: Boolean(workspace.name) },
    { label: "Add a workspace logo", isComplete: Boolean(workspace.logo) },
    {
      label: "Create your first chatbot",
      isComplete: (workspace.chatbot_count ?? 0) > 0,
    },
    {
      label: "Invite a teammate",
      isComplete: memberCount > 1 || invitations.length > 0,
    },
  ];
  const completedStepCount = setupSteps.filter(
    ({ isComplete }) => isComplete,
  ).length;
  const completionPercentage = Math.round(
    (completedStepCount / setupSteps.length) * 100,
  );

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <SectionTitle
          title="Workspace readiness"
          details="A few steps help you get the most from Argon."
        />
        <span className="text-sm font-bold text-primary">
          {completionPercentage}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Workspace readiness"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={completionPercentage}
        className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <div className="mt-4 space-y-3">
        {setupSteps.map(({ label, isComplete }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 text-sm text-muted-foreground"
          >
            {isComplete ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            ) : (
              <span className="size-4 shrink-0 rounded-full border border-border" />
            )}
            <span className={cn(isComplete && "text-foreground")}>{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-primary/5 p-3 text-xs text-muted-foreground">
        <Wifi className="size-4 shrink-0 text-primary" />
        Presence and member activity appear here in real time when available.
      </div>
    </Card>
  );
};

export default WorkspaceProgress;
