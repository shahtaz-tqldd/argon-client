import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/main";
import PrivateRoute from "./private-route";

// auth
const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-password"));
const VerifyOTPPage = lazy(() => import("@/pages/auth/verify-otp"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const ChatbotInvitation = lazy(() => import("@/pages/auth/chatbot-invitation"));

// workspace
const WorkspacePage = lazy(() => import("@/pages/workspace"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));

// chatbot
const ChatbotOverview = lazy(() => import("@/pages/chatbot/overview"));
const ChatSessionPage = lazy(() => import("@/pages/chatbot/chat-session"));
const AppointmentBookingPage = lazy(
  () => import("@/pages/chatbot/appointment"),
);
const LeadCollectionPage = lazy(
  () => import("@/pages/chatbot/lead-collection"),
);
const ConfigurationPage = lazy(() => import("@/pages/chatbot/configuration"));
const TeamMemberPage = lazy(() => import("@/pages/chatbot/team-member"));
const PlanAndBillingPage = lazy(
  () => import("@/pages/chatbot/plan-and-billing"),
);

// others
const SearchPage = lazy(() => import("@/pages/search"));
const AppFeaturesPage = lazy(() => import("@/pages/app-features"));

const withSuspense = (element) => (
  <Suspense fallback={null}>{element}</Suspense>
);

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: withSuspense(<WorkspacePage />),
      },
      {
        path: "/onboarding",
        element: withSuspense(<OnboardingPage />),
      },
      {
        path: "/chatbot/:chatbotSlug",
        element: withSuspense(<ChatbotOverview />),
      },
      {
        path: "/chatbot/:chatbotSlug/chat-session",
        element: withSuspense(<ChatSessionPage />),
      },
      {
        path: "/chatbot/:chatbotSlug/leads",
        element: withSuspense(<LeadCollectionPage />),
      },
      {
        path: "/chatbot/:chatbotSlug/appointments",
        element: withSuspense(<AppointmentBookingPage />),
      },
      {
        path: "/chatbot/:chatbotSlug/team",
        element: withSuspense(<TeamMemberPage />),
      },
      {
        path: "/chatbot/:chatbotSlug/configuration",
        element: withSuspense(<ConfigurationPage />),
      },
      {
        path: "/chatbot/:chatbotSlug/plan-and-billing",
        element: withSuspense(<PlanAndBillingPage />),
      },
      {
        path: "/search",
        element: withSuspense(<SearchPage />),
      },
      {
        path: "/profile",
        element: withSuspense(<ProfilePage />),
      },
      {
        path: "/app-features",
        element: withSuspense(<AppFeaturesPage />),
      },
    ],
  },
  {
    path: "/login",
    element: withSuspense(<LoginPage />),
  },
  {
    path: "/register",
    element: withSuspense(<RegisterPage />),
  },
  {
    path: "/verify-otp",
    element: withSuspense(<VerifyOTPPage />),
  },
  {
    path: "/forgot-password",
    element: withSuspense(<ForgotPasswordPage />),
  },
  {
    path: "/reset-password",
    element: withSuspense(<ResetPasswordPage />),
  },
  {
    path: "/chatbot-invitation",
    element: withSuspense(<ChatbotInvitation />),
  },
]);
