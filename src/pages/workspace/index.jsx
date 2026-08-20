import { Building2, RefreshCw } from "lucide-react";

import AppLogo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Text, Title } from "@/components/ui/typography";
import WorkspaceChatbots from "./components/chatbots";
import WorkspaceProgress from "./components/progress";
import WorkspaceTeam from "./components/team";

import useAuth from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";
import { useGetWorkspaceQuery } from "@/features/workspace/workspaceApiSlice";

const WorkspacePage = () => {
  const { user } = useAuth();
  const {
    data: workspaceResponse,
    isLoading,
    isError,
    refetch,
  } = useGetWorkspaceQuery();

  const workspace = workspaceResponse?.data;

  if (isLoading) return <WorkspacePageSkeleton />;
  if (isError || !workspace) return <WorkspaceError onRetry={refetch} />;

  return (
    <section className="mx-auto max-w-6xl space-y-10">
      <AppLogo />

      <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <WorkspaceLogo workspace={workspace} />
        <StatusBadge>active</StatusBadge>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
        <WorkspaceChatbots workspace={workspace} onWorkspaceChange={refetch} />

        <aside className="space-y-5">
          <WorkspaceTeam
            workspace={workspace}
            currentUser={user}
            onWorkspaceChange={refetch}
          />
          <WorkspaceProgress workspace={workspace} />
        </aside>
      </div>
    </section>
  );
};

const WorkspaceLogo = ({ workspace }) => (
  <aside className="flex min-w-0 items-center gap-4">
    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/20 via-primary/10 to-cyan-100 text-xl font-bold text-primary shadow-sm dark:to-cyan-950/50">
      {workspace.logo ? (
        <img
          src={workspace.logo}
          alt={`${workspace.name} logo`}
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(workspace.name)
      )}
    </div>
    <div className="min-w-0">
      <Title variant="lg" className="truncate">
        {workspace.name}
      </Title>
      <p className="mt-1 text-sm text-muted-foreground">
        {workspace.industry || "General workspace"}
      </p>
    </div>
  </aside>
);

const WorkspacePageSkeleton = () => (
  <div className="animate-pulse space-y-6 pt-2">
    <div className="h-20 rounded-3xl bg-muted" />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
      <div className="h-96 rounded-3xl bg-muted" />
      <div className="h-96 rounded-3xl bg-muted" />
    </div>
  </div>
);

const WorkspaceError = ({ onRetry }) => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Card className="max-w-md text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
        <Building2 className="size-5" />
      </div>
      <Title variant="md" className="mt-4">
        Workspace unavailable
      </Title>
      <Text variant="sm" className="mt-2">
        We couldn't load this workspace. Try reconnecting to continue.
      </Text>
      <Button type="button" onClick={onRetry} className="mt-5">
        <RefreshCw /> Try again
      </Button>
    </Card>
  </div>
);

export default WorkspacePage;
