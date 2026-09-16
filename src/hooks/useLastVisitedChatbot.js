import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  INITIAL_REDIRECT_SESSION_KEY,
  LAST_VISITED_CHATBOT_COOKIE_KEY,
} from "@/constants/session";
import { getCookieValue, setCookieValue } from "@/lib/cookie";

const CHATBOT_PATH_PATTERN = /^\/chatbot\/([^/]+)(?:\/|$)/;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const getChatbotSlug = (pathname) => {
  const encodedSlug = pathname.match(CHATBOT_PATH_PATTERN)?.[1];

  if (!encodedSlug) return null;

  try {
    return decodeURIComponent(encodedSlug);
  } catch {
    return encodedSlug;
  }
};

const wasInitialRedirectHandled = () => {
  try {
    return window.sessionStorage.getItem(INITIAL_REDIRECT_SESSION_KEY) === "true";
  } catch {
    return false;
  }
};

const markInitialRedirectHandled = () => {
  try {
    window.sessionStorage.setItem(INITIAL_REDIRECT_SESSION_KEY, "true");
  } catch {
    // The in-memory state still prevents repeat redirects for this app mount.
  }
};

const useLastVisitedChatbot = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const initialVisitHandledRef = useRef(wasInitialRedirectHandled());
  const chatbotSlug = getChatbotSlug(pathname);

  useEffect(() => {
    if (chatbotSlug) {
      setCookieValue(LAST_VISITED_CHATBOT_COOKIE_KEY, chatbotSlug, {
        maxAge: COOKIE_MAX_AGE_SECONDS,
      });
    }
  }, [chatbotSlug]);

  useLayoutEffect(() => {
    if (initialVisitHandledRef.current || wasInitialRedirectHandled()) {
      initialVisitHandledRef.current = true;
      return;
    }

    initialVisitHandledRef.current = true;
    markInitialRedirectHandled();

    // A direct/deep link is intentional. Restore the chatbot only from the
    // neutral workspace landing page used after sign-in and app entry.
    if (pathname !== "/") return;

    const savedChatbotSlug = getCookieValue(LAST_VISITED_CHATBOT_COOKIE_KEY);
    if (savedChatbotSlug) {
      navigate(`/chatbot/${encodeURIComponent(savedChatbotSlug)}`, {
        replace: true,
      });
    }
  }, [navigate, pathname]);
};

export default useLastVisitedChatbot;
