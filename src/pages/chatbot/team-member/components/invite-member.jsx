import { useState } from "react";
import { MailPlus, Send, ShieldCheck } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";
import { DialogHeaderTitle } from "@/components/ui/section";
import { CHATBOT_PERMISSIONS } from "@/constants/permission";
import { ALL_PERMISSIONS, EMAIL_PATTERN } from "@/constants/constraints";

const PermissionButton = ({ label, value, selected, onToggle, className }) => {
  return (
    <button
      type="button"
      value={value}
      aria-pressed={selected}
      onClick={() => onToggle(value)}
      className={cn(
        "flx gap-2 py-2.5 rounded-full px-4 text-sm font-medium outline-none transition-all",
        selected
          ? "bg-primary text-white"
          : "bg-primary/10 text-primary hover:bg-primary/15",
        className,
      )}
    >
      <span>{label}</span>
    </button>
  );
};

const InviteChatbotMemberDialog = ({
  open,
  onOpenChange,
  onInvite,
  isLoading = false,
}) => {
  const [submissionError, setSubmissionError] = useState("");
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      permissions: [],
    },
  });

  const selectedPermissions = useWatch({
    control,
    name: "permissions",
  });

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      reset({ email: "", permissions: [] });
      setSubmissionError("");
    }
    onOpenChange(nextOpen);
  };

  const togglePermission = (permission) => {
    if (permission === ALL_PERMISSIONS) {
      setValue(
        "permissions",
        selectedPermissions.includes(ALL_PERMISSIONS) ? [] : [ALL_PERMISSIONS],
        { shouldValidate: true },
      );
      return;
    }

    const individualPermissions = selectedPermissions.filter(
      (item) => item !== ALL_PERMISSIONS,
    );
    setValue(
      "permissions",
      individualPermissions.includes(permission)
        ? individualPermissions.filter((item) => item !== permission)
        : [...individualPermissions, permission],
      { shouldValidate: true },
    );
  };

  const submitInvitation = async ({ email, permissions }) => {
    setSubmissionError("");

    try {
      await onInvite({
        email: email.trim().toLowerCase(),
        permissions,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmissionError(
        getApiErrorMessage(error, "Unable to send the invitation."),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-lg">
        <form onSubmit={handleSubmit(submitInvitation)}>
          <DialogHeader className="border-b border-border bg-muted/40 px-6 py-6">
            <DialogHeaderTitle
              icon={MailPlus}
              title="Invite a team member"
              details="Invite someone and choose which parts of this chatbot they can
              manage."
            />
          </DialogHeader>

          <div className="space-y-6 px-6 py-6">
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

            <Controller
              name="permissions"
              control={control}
              rules={{
                validate: (permissions) =>
                  permissions.length > 0 || "Select at least one permission",
              }}
              render={() => (
                <fieldset disabled={isLoading}>
                  <legend className="text-sm font-semibold text-foreground">
                    Permissions
                  </legend>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose one or more areas this member can access.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <PermissionButton
                      label="All permissions"
                      value={ALL_PERMISSIONS}
                      selected={selectedPermissions.includes(ALL_PERMISSIONS)}
                      onToggle={togglePermission}
                      icon={ShieldCheck}
                    />
                    {CHATBOT_PERMISSIONS.map((permission) => (
                      <PermissionButton
                        key={permission.value}
                        {...permission}
                        selected={selectedPermissions.includes(
                          permission.value,
                        )}
                        onToggle={togglePermission}
                      />
                    ))}
                  </div>

                  {errors.permissions?.message && (
                    <p className="mt-2 text-xs text-red-500">
                      {errors.permissions.message}
                    </p>
                  )}
                </fieldset>
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

export default InviteChatbotMemberDialog;
