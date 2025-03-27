import { create } from "zustand";

const useSubscriptionStore = create((set) => ({
  subscription: null,
  loading: false,
  error: null,
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  hasActiveSubscription: false,
  remainingTokens: 0,
  updateSubscription: (subscription) =>
    set({
      subscription,
      hasActiveSubscription: subscription?.status === "active",
      remainingTokens: subscription?.tokens || 0,
    }),
}));

export default useSubscriptionStore;
