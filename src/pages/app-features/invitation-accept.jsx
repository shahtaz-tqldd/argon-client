import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAcceptChatbotInviteMutation } from "@/features/chatbot/chatbotApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import AuthContainer from "@/pages/auth/components/container";

const AcceptInvitationPage = () => {
  const [acceptChatbotInvite, { isLoading }] =
    useAcceptChatbotInviteMutation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [errorAnimationKey, setErrorAnimationKey] = useState(0);

  const token = searchParams.get("token") || "";

  const acceptInvitation = async () => {
    if (!token) {
      setError("This invitation link is missing a token.");
      setErrorAnimationKey((current) => current + 1);
      return;
    }

    try {
      await acceptChatbotInvite({ token }).unwrap();
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
      description="Accept the invitation to join this chatbot"
    >
      {error && (
        <div
          key={errorAnimationKey}
          className="error-bounce mb-6 -mt-4 rounded-lg border border-red-200 bg-red-100 p-2 text-center text-xs"
        >
          <span className="text-red-500">{error}</span>
        </div>
      )}

      <Button
        type="button"
        disabled={isLoading}
        className="h-11 w-full"
        onClick={acceptInvitation}
      >
        {isLoading ? "Accepting..." : "Accept Invitation"}
      </Button>
    </AuthContainer>
  );
};

export default AcceptInvitationPage;
