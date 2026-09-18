import { useEffect } from "react";
import useCurrentChatbot from "./useCurrentChatbot";
import { setPageTitle } from "@/lib/document-title";

const useTitle = (title) => {
  useEffect(() => {
    setPageTitle(title);
  }, [title]);
};

export const useChatbotTitle = (title) => {
  const { currentChatbot } = useCurrentChatbot();
  const chatbotName = currentChatbot?.chatbot_name;

  useEffect(() => {
    setPageTitle(
      chatbotName
        ? `Argon Chatbot — ${chatbotName} | ${title}`
        : `Argon Chatbot — ${title}`,
    );
  }, [chatbotName, title]);
};

export default useTitle;
