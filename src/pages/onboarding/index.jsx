import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  Camera,
  Check,
  MailPlus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";

import InviteMemberDialog from "@/components/dialog/invite-member-dialog";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import {
  useGetWorkspaceQuery,
  useInviteWorkspaceMemberMutation,
  useUpdateWorkspaceMutation,
} from "@/features/workspace/workspaceApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import AuthContainer from "@/pages/auth/components/container";

const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const SUPPORTED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const getInitials = (name) =>
  String(name || "Workspace")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "W";

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [sentInvitations, setSentInvitations] = useState([]);

  const {
    data: workspaceResponse,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    refetch,
  } = useGetWorkspaceQuery();
  const [updateWorkspace, { isLoading: isUpdating }] =
    useUpdateWorkspaceMutation();
  const [inviteWorkspaceMember, { isLoading: isInviting }] =
    useInviteWorkspaceMemberMutation();

  const workspace = workspaceResponse?.data;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      industry: "",
    },
  });

  const workspaceName = useWatch({ control, name: "name" });
  const activeLogo = logoPreview || workspace?.logo || "";
  const initials = getInitials(workspaceName);

  useEffect(() => {
    if (!workspace) return;
    reset({
      name: workspace.name || "",
      industry: workspace.industry || "",
    });
  }, [reset, workspace]);

  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    },
    [logoPreview],
  );

  const selectLogo = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!SUPPORTED_LOGO_TYPES.includes(file.type)) {
      toast.error("Choose a PNG, JPG, or WebP image");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      toast.error("Workspace logo must be smaller than 5 MB");
      return;
    }

    setLogoFile(file);
    setLogoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const clearSelectedLogo = () => {
    setLogoFile(null);
    setLogoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
  };

  const skipOnboarding = () => navigate("/", { replace: true });

  const saveWorkspace = async (values) => {
    if (!workspace) return;

    const name = values.name.trim();
    const industry = values.industry.trim();
    const nameChanged = name !== workspace.name;
    const industryChanged = industry !== (workspace.industry || "");

    if (!nameChanged && !industryChanged && !logoFile) {
      skipOnboarding();
      return;
    }

    const payload = new FormData();

    if (nameChanged) payload.append("name", name);
    if (industryChanged) payload.append("industry", industry);
    if (logoFile) payload.append("logo", logoFile);

    try {
      await updateWorkspace({
        workspaceSlug: workspace.slug,
        payload,
      }).unwrap();
      toast.success("Workspace setup saved");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update the workspace."));
    }
  };

  const sendInvitation = async (email) => {
    const response = await inviteWorkspaceMember({
      workspaceSlug: workspace.slug,
      email,
    }).unwrap();
    const invitation = response?.data || { email };
    setSentInvitations((current) => [invitation, ...current]);
    toast.success(`Invitation sent to ${invitation.email || email}`);
  };

  if (isWorkspaceLoading) {
    return (
      <AuthContainer
        title="Set up your workspace"
        description="Add the details your team will see across Argon."
        containerClassName="max-w-4xl"
        panelClassName="rounded-3xl border bg-card p-5 shadow-xl sm:p-8"
      >
        <div className="animate-pulse space-y-5">
          <div className="h-64 rounded-3xl bg-muted" />
          <div className="h-36 rounded-3xl bg-muted" />
        </div>
      </AuthContainer>
    );
  }

  if (isWorkspaceError || !workspace) {
    return (
      <AuthContainer
        title="We couldn’t load your workspace"
        description="Try again, or continue and finish setting it up later."
      >
        <div className="flex flex-col gap-3">
          <Button type="button" onClick={refetch}>
            <RefreshCw /> Try again
          </Button>
          <Button type="button" variant="ghost" onClick={skipOnboarding}>
            Skip for now
          </Button>
        </div>
      </AuthContainer>
    );
  }

  return (
    <>
      <AuthContainer
        title="Set up your workspace"
        containerClassName="max-w-3xl"
        panelClassName="rounded-3xl border bg-card p-5 shadow-xl sm:p-8"
      >
        <form onSubmit={handleSubmit(saveWorkspace)} className="space-y-5">
          <section className="overflow-hidden rounded-3xl border border-border bg-background">
            <div className="flex items-start gap-4 border-b border-border bg-muted/35 px-5 py-5 sm:px-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Personalize your workspace
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  These details help members identify the right workspace.
                </p>
              </div>
            </div>

            <div className="gap-7 p-5 sm:p-6 flex">
              <div className="max-w-[140px] w-full">
                <div className="group relative mx-auto size-32 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-primary/10 to-cyan-100 shadow-sm dark:to-cyan-950/40 md:mx-0">
                  {activeLogo ? (
                    <img
                      src={activeLogo}
                      alt={`${workspaceName || "Workspace"} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-primary">
                      {initials}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/25 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                    aria-label="Upload workspace logo"
                  >
                    <Camera className="size-6" />
                  </button>
                  {logoFile && (
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="destructive"
                      onClick={clearSelectedLogo}
                      aria-label="Discard selected logo"
                      className="absolute top-2 right-2"
                    >
                      <X />
                    </Button>
                  )}
                </div>

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={selectLogo}
                  className="sr-only"
                />

                <div className="mt-2 text-center flex flex-col items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="truncate">
                    {logoFile ? `${logoFile.name} ` : "PNG, JPG, or WebP"}
                  </span>
                  <span>
                    {logoFile ? formatFileSize(logoFile.size) : "max 1 MB"}
                  </span>
                </div>
              </div>

              <div className="space-y-5 pt-1 flex-1">
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: "Workspace name is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Workspace name is required",
                    maxLength: {
                      value: 120,
                      message: "Use 120 characters or fewer",
                    },
                  }}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Workspace name"
                      autoComplete="organization"
                      error={errors.name?.message}
                    />
                  )}
                />

                <Controller
                  name="industry"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 100,
                      message: "Use 100 characters or fewer",
                    },
                  }}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Industry (optional)"
                      placeholder="e.g. Software, Healthcare, Education"
                      autoComplete="organization-title"
                      error={errors.industry?.message}
                    />
                  )}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    Invite your teammates
                  </h2>
                  <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                    Send a secure email invitation now, or add members later
                    from workspace settings.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="sm:self-center"
                onClick={() => setInviteDialogOpen(true)}
              >
                <MailPlus /> Invite member
              </Button>
            </div>

            {sentInvitations.length > 0 && (
              <div className="mt-5 border-t border-border pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Invitations sent
                </p>
                <div className="flex flex-wrap gap-2">
                  {sentInvitations.map((invitation) => (
                    <span
                      key={invitation.id || invitation.email}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                    >
                      <Check className="size-3.5" /> {invitation.email}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={skipOnboarding}
              disabled={isUpdating}
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={isUpdating} className="sm:px-6">
              {isUpdating ? "Saving…" : "Continue to workspace"}
              {!isUpdating && <ArrowRight />}
            </Button>
          </div>
        </form>
      </AuthContainer>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={sendInvitation}
        isLoading={isInviting}
        workspaceName={workspace.name}
      />
    </>
  );
};

export default OnboardingPage;
