import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { PENDING_VERIFICATION_EMAIL_KEY } from "@/constants/session";
import { useVerifyOTPMutation } from "@/features/auth/authApiSlice";
import { userLoggedIn } from "@/features/auth/authSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import AuthContainer from "./components/container";

const getPendingEmail = (location) => {
  if (location.state?.email) return location.state.email;

  try {
    return window.sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY) || "";
  } catch {
    return "";
  }
};

const VerifyOTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const email = getPendingEmail(location);
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = useRef([]);
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();

  const setDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item)),
    );
    setError("");
    if (digit && index < 3) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const value = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!value) return;

    event.preventDefault();
    setDigits(Array.from({ length: 4 }, (_, index) => value[index] || ""));
    inputs.current[Math.min(value.length, 4) - 1]?.focus();
    setError("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const otp = digits.join("");

    if (!email) {
      setError("Your verification session has expired. Please register again.");
      return;
    }
    if (otp.length !== 4) {
      setError("Enter the 4-digit code sent to your email.");
      return;
    }

    try {
      const response = await verifyOTP({ email, otp }).unwrap();
      const accountData = response?.data || {};

      if (!accountData.access_token || !accountData.refresh_token) {
        throw new Error("Verification succeeded without login tokens.");
      }

      dispatch(
        userLoggedIn({
          accessToken: accountData.access_token,
          refreshToken: accountData.refresh_token,
          rememberMe: false,
        }),
      );
      try {
        window.sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
      } catch {
        // Session storage may be unavailable in restricted browsers.
      }
      navigate("/onboarding", { replace: true });
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "The verification code is invalid or expired."),
      );
    }
  };

  return (
    <AuthContainer
      title="Verify your email"
      description={
        email
          ? `Enter the 4-digit code sent to ${email}.`
          : "Enter the code from your verification email."
      }
    >
      <form onSubmit={onSubmit}>
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              // The position is stable and is the identity of each OTP box.
              key={index}
              ref={(element) => {
                inputs.current[index] = element;
              }}
              value={digit}
              onChange={(event) => setDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              autoFocus={index === 0}
              aria-label={`Verification code digit ${index + 1}`}
              className="size-14 rounded-xl border border-input bg-card text-center text-2xl font-semibold text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              maxLength={1}
            />
          ))}
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          disabled={isLoading || digits.some((digit) => !digit)}
          className="mt-6 h-11 w-full"
        >
          {isLoading ? "Verifying..." : "Verify and continue"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Register again
        </Link>
      </p>
    </AuthContainer>
  );
};

export default VerifyOTPPage;
