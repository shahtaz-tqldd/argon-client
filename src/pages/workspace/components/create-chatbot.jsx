import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Bot, Camera, Check, MailPlus, Plus, Users, X } from "lucide-react";
import { toast } from "sonner";

import InviteMemberDialog from "@/components/dialog/invite-member-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import {
  useCreateChatbotMutation,
  useInviteChatbotMemberMutation,
} from "@/features/chatbot/chatbotApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { MAX_LOGO_SIZE, SUPPORTED_LOGO_TYPES } from "@/constants/constraints";
import { getInitials } from "@/lib/utils";
import { formatFileSize } from "@/lib/file-handle";

const getCreatedChatbot = (response) => {
  const data = response?.data?.data || response?.data || response;
  return data?.chatbot || data;
};

const CreateChatbotDialog = ({
  open,
  onOpenChange,
  workspaceSlug,
  workspaceName = "your workspace",
  onCreated,
}) => {
  const logoInputRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [invitationEmails, setInvitationEmails] = useState([]);
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createChatbot] = useCreateChatbotMutation();
  const [inviteChatbotMember] = useInviteChatbotMemberMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const chatbotName = useWatch({ control, name: "name" });

  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    },
    [logoPreview],
  );

  const resetDialog = () => {
    reset({ name: "", description: "" });
    setLogoFile(null);
    setLogoPreview("");
    setInvitationEmails([]);
    setSubmissionError("");
    setInviteDialogOpen(false);
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && isSubmitting) return;
    if (!nextOpen) resetDialog();
    onOpenChange(nextOpen);
  };

  const selectLogo = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!SUPPORTED_LOGO_TYPES.includes(file.type)) {
      toast.error("Choose a PNG, JPG, or WebP image");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      toast.error("Chatbot logo must be smaller than 5 MB");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearSelectedLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  const queueInvitation = async (email) => {
    setInvitationEmails((current) =>
      current.includes(email) ? current : [...current, email],
    );
  };

  const removeInvitation = (email) => {
    setInvitationEmails((current) =>
      current.filter((invitationEmail) => invitationEmail !== email),
    );
  };

  const closeAfterCreation = () => {
    resetDialog();
    onOpenChange(false);
  };

  const submitChatbot = async (values) => {
    setSubmissionError("");
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("name", values.name.trim());
    payload.append("description", values.description.trim());
    payload.append("workspace_slug", workspaceSlug);
    if (logoFile) payload.append("logo", logoFile);

    try {
      const response = await createChatbot({ payload }).unwrap();
      const chatbot = getCreatedChatbot(response);
      const chatbotSlug = chatbot?.slug;
      let failedInvitationCount = 0;

      if (invitationEmails.length && chatbotSlug) {
        const invitationResults = await Promise.allSettled(
          invitationEmails.map((email) =>
            inviteChatbotMember({ chatbotSlug, email }).unwrap(),
          ),
        );
        failedInvitationCount = invitationResults.filter(
          (result) => result.status === "rejected",
        ).length;
      } else if (invitationEmails.length) {
        failedInvitationCount = invitationEmails.length;
      }

      try {
        await onCreated?.(chatbot);
      } catch {
        // The chatbot was created successfully even if refreshing its parent fails.
      }

      closeAfterCreation();
      const sentInvitationCount =
        invitationEmails.length - failedInvitationCount;
      toast.success(
        sentInvitationCount
          ? `Chatbot created and ${sentInvitationCount} invitation${sentInvitationCount === 1 ? "" : "s"} sent`
          : "Chatbot created successfully",
      );

      if (failedInvitationCount) {
        toast.warning(
          `${failedInvitationCount} invitation${failedInvitationCount === 1 ? "" : "s"} could not be sent`,
        );
      }
    } catch (error) {
      setSubmissionError(
        getApiErrorMessage(error, "Unable to create the chatbot."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl p-0 sm:max-w-2xl">
          <form onSubmit={handleSubmit(submitChatbot)}>
            <DialogHeader className="border-b border-border bg-muted/40 px-6 py-6">
              <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="size-5" />
              </div>
              <DialogTitle>Create a chatbot</DialogTitle>
              <DialogDescription className="leading-6">
                Add an identity for your assistant and invite teammates to help
                manage it in {workspaceName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 px-6 py-6">
              <section className="flex flex-col gap-5 sm:flex-row">
                <div className="w-full shrink-0 sm:w-32">
                  <div className="group relative mx-auto size-28 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-primary/10 to-cyan-100 shadow-sm dark:to-cyan-950/40 sm:mx-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt={`${chatbotName || "Chatbot"} logo preview`}
                        className="h-full w-full object-cover"
                      />
                    ) : chatbotName?.trim() ? (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
                        {getInitials(chatbotName)}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary">
                        <Bot className="size-8" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="absolute inset-0 flex items-center justify-center bg-black/25 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 disabled:pointer-events-none"
                      aria-label="Upload chatbot logo"
                    >
                      <Camera className="size-6" />
                    </button>

                    {logoFile && (
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="destructive"
                        onClick={clearSelectedLogo}
                        disabled={isSubmitting}
                        aria-label="Discard selected logo"
                        className="absolute right-2 top-2"
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
                    disabled={isSubmitting}
                    className="sr-only"
                  />

                  <div className="mt-2 text-center text-[10px] text-muted-foreground sm:text-left">
                    <p className="truncate">
                      {logoFile ? logoFile.name : "PNG, JPG, or WebP"}
                    </p>
                    <p>
                      {logoFile ? formatFileSize(logoFile.size) : "max 5 MB"}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-5 pt-1">
                  <Controller
                    name="name"
                    control={control}
                    rules={{
                      required: "Chatbot name is required",
                      validate: (value) =>
                        value.trim().length > 0 || "Chatbot name is required",
                      maxLength: {
                        value: 120,
                        message: "Use 120 characters or fewer",
                      },
                    }}
                    render={({ field }) => (
                      <FloatingInput
                        {...field}
                        label="Chatbot name"
                        error={errors.name?.message}
                        disabled={isSubmitting}
                        autoFocus
                      />
                    )}
                  />

                  <Controller
                    name="description"
                    control={control}
                    rules={{
                      maxLength: {
                        value: 1000,
                        message: "Use 1,000 characters or fewer",
                      },
                    }}
                    render={({ field }) => (
                      <FloatingTextarea
                        {...field}
                        label="Description (optional)"
                        placeholder="What should this chatbot help with?"
                        rows={4}
                        textareaClassName="min-h-28 resize-none"
                        error={errors.description?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Users className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Invite chatbot members
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Invitations are sent after the chatbot is created.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInviteDialogOpen(true)}
                    disabled={isSubmitting}
                  >
                    <MailPlus /> Invite member
                  </Button>
                </div>

                {invitationEmails.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    {invitationEmails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 py-1.5 pl-3 pr-1.5 text-xs font-medium text-primary"
                      >
                        <Check className="size-3.5" /> {email}
                        <button
                          type="button"
                          onClick={() => removeInvitation(email)}
                          disabled={isSubmitting}
                          className="ml-0.5 rounded-full p-0.5 transition hover:bg-primary/10 disabled:pointer-events-none"
                          aria-label={`Remove ${email} invitation`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {submissionError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-950/30"
                >
                  {submissionError}
                </p>
              )}
            </div>

            <DialogFooter className="border-t border-border bg-muted/30 px-6 py-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !workspaceSlug}>
                <Plus /> {isSubmitting ? "Creating…" : "Create chatbot"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={queueInvitation}
        title="Invite a chatbot member"
        description="Add their email now and we’ll send the invitation after the chatbot is created."
        infoText="Chatbot invitations are single-use and expire automatically for better account security."
        submitLabel="Add invitation"
      />
    </>
  );
};

export default CreateChatbotDialog;
