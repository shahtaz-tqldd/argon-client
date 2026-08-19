import { useChangePasswordMutation } from "@/features/auth/authApiSlice";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/input";
import { KeyRound, LockKeyhole } from "lucide-react";

const getErrorMessage = (error) => {
  const apiError = error?.data?.error;
  if (Array.isArray(apiError)) return apiError[0];
  if (typeof apiError === "string") return apiError;
  return error?.data?.message || "Unable to update the password.";
};

const PasswordUpdateDialog = ({ open, onOpenChange }) => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });
  const newPassword = useWatch({ control, name: "new_password" });

  const handleOpenChange = (nextOpen) => {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  };

  const onSubmit = async (values) => {
    try {
      await changePassword(values).unwrap();
      toast.success("Password changed successfully");
      handleOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl border-slate-200 p-0 sm:max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Use a unique password with at least eight characters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-6">
            <Controller
              name="current_password"
              control={control}
              rules={{ required: "Current password is required" }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  type="password"
                  label="Current password"
                  error={errors.current_password?.message}
                />
              )}
            />
            <Controller
              name="new_password"
              control={control}
              rules={{
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Use at least 6 characters",
                },
              }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  type="password"
                  label="New password"
                  error={errors.new_password?.message}
                />
              )}
            />
            <Controller
              name="confirm_new_password"
              control={control}
              rules={{
                required: "Confirm your new password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  type="password"
                  label="Confirm new password"
                  error={errors.confirm_new_password?.message}
                />
              )}
            />
          </div>

          <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <LockKeyhole />
              {isLoading ? "Updating..." : "Update password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordUpdateDialog;
