import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { userLoggedIn } from "@/features/auth/authSlice";
import { useAcceptChatbotInviteMutation } from "@/features/chatbot/chatbotApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import AuthContainer from "./components/container";

const ChatbotInvitation = () => {
  const [acceptChatbotInvite, { isLoading }] =
    useAcceptChatbotInviteMutation();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const [errorAnimationKey, setErrorAnimationKey] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async ({ name, password, confirm_password }) => {
    if (!token) {
      setError("This invitation link is missing a token.");
      setErrorAnimationKey((current) => current + 1);
      return;
    }

    try {
      const response = await acceptChatbotInvite({
        token,
        name: name.trim(),
        password,
        confirm_password,
      }).unwrap();
      const accountData = response?.data || {};

      if (!accountData.access_token || !accountData.refresh_token) {
        throw new Error("Invitation accepted without login tokens.");
      }

      dispatch(
        userLoggedIn({
          accessToken: accountData.access_token,
          refreshToken: accountData.refresh_token,
          rememberMe: false,
        }),
      );
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Accepting chatbot invitation failed:", error);
      setError(getApiErrorMessage(error, "Failed to accept invitation!"));
      setErrorAnimationKey((current) => current + 1);
    }
  };

  return (
    <AuthContainer
      title="Accept Chatbot Invitation"
      description="Enter your name and password to continue"
    >
      {error && (
        <div
          key={errorAnimationKey}
          className="error-bounce mb-6 -mt-4 rounded-lg border border-red-200 bg-red-100 p-2 text-center text-xs"
        >
          <span className="text-red-500">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {email && (
          <FloatingInput
            name="email"
            label="Email Address"
            type="email"
            value={email}
            disabled
            readOnly
          />
        )}

        <Controller
          name="name"
          control={control}
          rules={{
            required: "Name is required",
            validate: (value) => value.trim() !== "" || "Name is required",
          }}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Name"
              autoComplete="name"
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          name="confirm_password"
          control={control}
          rules={{
            required: "Confirm password is required",
            validate: (value, formValues) =>
              value === formValues.password || "Passwords do not match",
          }}
          render={({ field }) => (
            <FloatingInput
              {...field}
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              error={errors.confirm_password?.message}
            />
          )}
        />

        <Button type="submit" disabled={isLoading} className="h-11 w-full">
          {isLoading ? "Accepting..." : "Accept Invitation"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthContainer>
  );
};

export default ChatbotInvitation;
