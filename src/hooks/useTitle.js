import { useEffect } from "react";
import useCurrentChatbot from "./useCurrentChatbot";

const useTitle = (title) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

export const useChatbotTitle = (title) => {
  const { currentChatbot } = useCurrentChatbot();
  const chatbotName = currentChatbot?.chatbot_name;

  useEffect(() => {
    document.title = chatbotName
      ? `Argon Chatbot — ${chatbotName} | ${title}`
      : `Argon Chatbot — ${title}`;
  }, [chatbotName, title]);
};

export default useTitle;
