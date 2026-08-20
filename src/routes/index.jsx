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

// workspace
const WorkspacePage = lazy(() => import("@/pages/workspace"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));

// chatbot
const ChatbotOverview = lazy(() => import("@/pages/chatbot/overview"));

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
        path: "/search",
        element: withSuspense(<SearchPage />),
      },
      {
        path: "/profile/:username",
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
]);
