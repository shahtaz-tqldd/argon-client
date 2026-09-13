import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { apiSlice } from "./features/api/apiSlice";
import authReducer from "./features/auth/authSlice";
import chatbotReducer from "./features/chatbot/chatbotSlice";
import chatbotPresenceReducer from "./features/chatbot/presenceSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    chatbot: chatbotReducer,
    chatbotPresence: chatbotPresenceReducer,
  },
  devTools: import.meta.env.VITE_ENV !== "PRODUCTION",
  middleware: (gDM) => gDM().concat([apiSlice.middleware]),
});

setupListeners(store.dispatch);
