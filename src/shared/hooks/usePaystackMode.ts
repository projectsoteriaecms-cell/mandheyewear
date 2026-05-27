import { useState, useCallback } from "react";

export type PaystackMode = "test" | "live";

const STORAGE_KEY = "soteria_paystack_mode";

/** Read the persisted mode without triggering a re-render (safe to call outside components). */
export const getPaystackMode = (): PaystackMode =>
  (localStorage.getItem(STORAGE_KEY) as PaystackMode) || "test";

/**
 * Reactive hook for the active Paystack payment mode.
 *
 * Returns:
 *  - `mode`      — "test" | "live"
 *  - `publicKey` — the Paystack public key for the current mode
 *  - `setMode`   — persist and update the mode (admin use only)
 *  - `isLive` / `isTest` — convenience booleans
 */
export const usePaystackMode = () => {
  const [mode, setModeState] = useState<PaystackMode>(getPaystackMode);

  const setMode = useCallback((newMode: PaystackMode) => {
    localStorage.setItem(STORAGE_KEY, newMode);
    setModeState(newMode);
  }, []);

  const publicKey =
    mode === "live"
      ? (import.meta.env.VITE_PAYSTACK_LIVE_KEY as string) || ""
      : (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) ||
        "pk_test_b65019a2e28f286dd4906d6aaa80bff38f035460";

  return {
    mode,
    setMode,
    publicKey,
    isLive: mode === "live",
    isTest: mode === "test",
  };
};
