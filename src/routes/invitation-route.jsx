import { lazy } from "react";
import { useSearchParams } from "react-router-dom";

const ChatbotInvitation = lazy(() =>
  import("@/pages/auth/chatbot-invitation"),
);
const AcceptInvitationPage = lazy(() =>
  import("@/pages/app-features/invitation-accept"),
);

const InvitationRoute = () => {
  const [searchParams] = useSearchParams();

  return searchParams.get("new_user") === "true" ? (
    <ChatbotInvitation />
  ) : (
    <AcceptInvitationPage />
  );
};

export default InvitationRoute;
