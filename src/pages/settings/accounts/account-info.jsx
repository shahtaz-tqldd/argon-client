import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Camera,
  Check,
  KeyRound,
  MapPin,
  Save,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import Card from "@/components/ui/card";
import { useUpdateAdminInfoMutation } from "@/features/auth/authApiSlice";
import { getCloudinaryPreviewUrl } from "@/lib/image";

const getInitials = (name) =>
  String(name || "Super Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const AccountInfo = ({ user, onProfilePreviewChange, setPasswordOpen }) => {
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [updateAdminInfo, { isLoading }] = useUpdateAdminInfoMutation();

  const fileInputRef = useRef(null);
  const userFullname = user?.name || "Super Admin";
  const userEmail = user?.email || "";
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: { fullname: "", email: "" },
  });

  const profileImage = avatarPreview || user?.avatar_url || "";

  useEffect(() => {
    reset({
      fullname: userFullname,
      email: userEmail,
    });
  }, [reset, userEmail, userFullname]);

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be smaller than 5 MB");
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextPreview;
    });
    onProfilePreviewChange(nextPreview);
    event.target.value = "";
  };

  const discardChanges = () => {
    reset({ fullname: userFullname, email: userEmail });
    setAvatarFile(null);
    setAvatarPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
    onProfilePreviewChange("");
  };

  const saveProfile = async (values) => {
    const payload = new FormData();
    payload.append("fullname", values.fullname.trim());
    if (avatarFile) payload.append("avatar", avatarFile);

    try {
      await updateAdminInfo(payload).unwrap();
      toast.success("Profile updated successfully");
      reset(values);
      setAvatarFile(null);
      setAvatarPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
      onProfilePreviewChange("");
    } catch (error) {
      const apiError = error?.data?.error;
      const message = Array.isArray(apiError)
        ? apiError[0]
        : apiError || error?.data?.message || "Unable to update profile";
      toast.error(message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="p-0">
        <div className="h-24 bg-gradient-to-br from-cyan-100 via-emerald-50 to-rose-100" />
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4 h-24 w-24">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-emerald-100 text-2xl font-bold text-primary">
              {profileImage ? (
                <img
                  src={getCloudinaryPreviewUrl(profileImage)}
                  alt={userFullname}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(userFullname)
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-background bg-foreground text-background shadow-md transition hover:bg-primary hover:text-primary-foreground"
              aria-label="Change profile picture"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImage}
              className="sr-only"
            />
          </div>

          <h3 className="text-lg font-bold text-slate-900">{userFullname}</h3>
          <p className="mt-1 truncate text-sm text-slate-500">
            {user?.email || "No email address"}
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/15">
            <ShieldCheck className="h-3.5 w-3.5" />
            Super Admin
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{user?.location || "Dhaka, Bangladesh"}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Profile information
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              This identifies the platform owner across the admin portal.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Check className="h-3.5 w-3.5" /> Active account
          </span>
        </div>

        <form onSubmit={handleSubmit(saveProfile)} className="mt-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-6">
              <Controller
                name="fullname"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FloatingInput
                    {...field}
                    label="Full name"
                    error={errors.fullname?.message}
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
                    type="email"
                    label="Email address"
                    error={errors.email?.message}
                    disabled
                  />
                )}
              />
            </div>

            <div className="">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">Password</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Rotate your password regularly and avoid reusing it
                    elsewhere.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() => setPasswordOpen(true)}
                  >
                    <KeyRound /> Change password
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={(!isDirty && !avatarFile) || isLoading}
              onClick={discardChanges}
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={(!isDirty && !avatarFile) || isLoading}
            >
              <Save /> {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AccountInfo;
