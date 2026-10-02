export const createSlotKey = () =>
  globalThis.crypto?.randomUUID?.() ||
  `slot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
