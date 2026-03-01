import { create } from "zustand";

const useStore = create((set) => ({
  accountBalance: 1250.0,
  apiUsage: {
    used: 12500,
    limit: 50000,
  },
  apiKeys: [
    {
      id: "1",
      name: "Production",
      key: "sk_live_1234567890abcdef",
      createdAt: "2023-10-01T12:00:00Z",
    },
    {
      id: "2",
      name: "Development",
      key: "sk_test_0987654321fedcba",
      createdAt: "2023-10-05T15:30:00Z",
    },
  ],
  decreaseBalance: (amount) =>
    set((state) => ({
      accountBalance: Math.max(0, state.accountBalance - amount),
    })),
  incrementUsage: (amount) =>
    set((state) => ({
      apiUsage: { ...state.apiUsage, used: state.apiUsage.used + amount },
    })),
  addApiKey: (newKey) =>
    set((state) => ({
      apiKeys: [...state.apiKeys, newKey],
    })),
  removeApiKey: (id) =>
    set((state) => ({
      apiKeys: state.apiKeys.filter((k) => k.id !== id),
    })),
}));

export default useStore;
