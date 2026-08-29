import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { useChatbotDetailsQuery } from "@/features/chatbot/chatbotApiSlice";
import {
  currentChatbotCleared,
  currentChatbotFetched,
} from "@/features/chatbot/chatbotSlice";

const useCurrentChatbot = () => {
  const dispatch = useDispatch();
  const { chatbotSlug } = useParams();
  const storedChatbot = useSelector((state) => state.chatbot.currentChatbot);
  const query = useChatbotDetailsQuery({ chatbotSlug }, { skip: !chatbotSlug });

  const fetchedChatbot = query.data?.data;

  useEffect(() => {
    if (fetchedChatbot) {
      dispatch(currentChatbotFetched(fetchedChatbot));
    }
  }, [dispatch, fetchedChatbot]);

  useEffect(() => {
    if (!chatbotSlug) {
      dispatch(currentChatbotCleared());
    }
  }, [chatbotSlug, dispatch]);

  const currentChatbot =
    fetchedChatbot ||
    (storedChatbot?.slug === chatbotSlug ? storedChatbot : null);

  return {
    ...query,
    chatbotSlug,
    currentChatbot,
  };
};

export default useCurrentChatbot;
