import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { useUpdateAccountMutation } from "@/features/auth/authApiSlice";
import useAuth from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { getCloudinaryPreviewUrl } from "@/lib/image";
import { getInitials } from "@/lib/utils";
import PasswordUpdateDialog from "./components/password-update";

const ProfilePage = () => {
  const { chatbotSlug } = useParams();
  const { user, isLoading: isProfileLoading, refetchProfile } = useAuth();
  const [updateAccount, { isLoading: isSaving }] =
    useUpdateAccountMutation();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [previewProfile, setPreviewProfile] = useState(() => ({
    name: "Shahtaz Ahmed",
    email: "shahtaz@argon.ai",
    avatar_url: "",
  }));

  const profile = user || previewProfile;
  const formValues = useMemo(
    () => ({
      name: profile?.name || "",
      email: profile?.email || "",
    }),
    [profile?.email, profile?.name],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: formValues });

  useEffect(() => {
    reset(formValues);
  }, [formValues, reset]);

  const onSubmit = async (values) => {
    if (!user) {
      setPreviewProfile((current) => ({ ...current, ...values }));
      reset(values);
      toast.success("Profile updated");
      return;
    }

    try {
      await updateAccount(values).unwrap();
      await refetchProfile();
      reset(values);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update your profile."));
    }
  };

  if (isProfileLoading && user) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-5 pt-5">
        <div className="h-20 rounded-2xl bg-muted" />
        <div className="h-72 rounded-3xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl pb-10 pt-3">
      <header className="pr-14">
        <Link
          to={chatbotSlug ? `/chatbot/${chatbotSlug}` : "/"}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {chatbotSlug ? "Back to chatbot" : "Back to workspace"}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Manage your personal details and account security.
        </p>
      </header>

      <Card className="mt-7 p-0">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          {profile?.avatar_url ? (
            <img
              src={getCloudinaryPreviewUrl(profile.avatar_url, 180)}
              alt={profile.name}
              className="size-20 rounded-2xl object-cover ring-4 ring-primary/10"
            />
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-semibold text-primary ring-4 ring-primary/5">
              {getInitials(profile?.name)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold">
              {profile?.name || "Your profile"}
            </h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {profile?.email}
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="size-3.5" />
            Active account
          </div>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
        <Card>
          <div>
            <h2 className="text-lg font-semibold">Personal information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update the details connected to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Full name"
                  autoComplete="name"
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                />
              )}
            />

            <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
              <Button
                type="button"
                variant="ghost"
                disabled={!isDirty || isSaving}
                onClick={() => reset(formValues)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isDirty || isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="h-fit">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">Password</h2>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            Keep your account secure with a strong, unique password.
          </p>

          <div className="my-5 flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-4">
            <KeyRound className="size-4 text-muted-foreground" />
            <span className="text-lg tracking-[0.28em] text-muted-foreground">
              ••••••••
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setIsPasswordDialogOpen(true)}
          >
            <KeyRound />
            Change password
          </Button>
        </Card>
      </div>

      <PasswordUpdateDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </div>
  );
};

export default ProfilePage;
