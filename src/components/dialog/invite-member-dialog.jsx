import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MailPlus, Send, Users } from "lucide-react";

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
import { getApiErrorMessage } from "@/lib/get-api-error-message";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InviteMemberDialog = ({
  open,
  onOpenChange,
  onInvite,
  isLoading = false,
  workspaceName = "your workspace",
}) => {
  const [submissionError, setSubmissionError] = useState("");
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { email: "" } });

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      reset({ email: "" });
      setSubmissionError("");
    }
    onOpenChange(nextOpen);
  };

  const submitInvitation = async ({ email }) => {
    setSubmissionError("");

    try {
      await onInvite(email.trim().toLowerCase());
      reset({ email: "" });
      handleOpenChange(false);
    } catch (error) {
      setSubmissionError(
        getApiErrorMessage(error, "Unable to send the invitation."),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl p-0 sm:max-w-[480px]">
        <form onSubmit={handleSubmit(submitInvitation)}>
          <DialogHeader className="border-b border-border bg-muted/40 px-6 py-6">
            <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MailPlus className="size-5" />
            </div>
            <DialogTitle>Invite a workspace member</DialogTitle>
            <DialogDescription className="leading-6">
              We’ll email them a secure invitation to join {workspaceName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-6">
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email address is required",
                pattern: {
                  value: EMAIL_PATTERN,
                  message: "Enter a valid email address",
                },
              }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  type="email"
                  label="Email address"
                  autoComplete="email"
                  error={errors.email?.message}
                  disabled={isLoading}
                  autoFocus
                />
              )}
            />

            {submissionError && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-950/30"
              >
                {submissionError}
              </p>
            )}

            <div className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4 text-sm text-muted-foreground">
              <Users className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                Invitations are single-use and expire automatically for better
                account security.
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-border bg-muted/30 px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              <Send /> {isLoading ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;
