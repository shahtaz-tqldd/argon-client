import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentChatbot: null,
};

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    currentChatbotFetched: (state, action) => {
      state.currentChatbot = action.payload;
    },
    currentChatbotCleared: (state) => {
      state.currentChatbot = null;
    },
  },
});

export const { currentChatbotFetched, currentChatbotCleared } =
  chatbotSlice.actions;

export default chatbotSlice.reducer;
