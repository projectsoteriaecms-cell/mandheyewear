import { supabase } from "@/integrations/supabase/client";

/**
 * Platform telemetry — the capture layer.
 *
 * Every touchpoint (page view, auth step, key action, crash) lands in
 * public.platform_events. Works for anonymous visitors as well as signed-in
 * users, so we can see a journey from first landing through signup.
 *
 * Rules this module follows:
 *  - Never throw. Telemetry must not be able to break the app it observes.
 *  - Never block. Writes are fire-and-forget.
 *  - Never send PII beyond what we already store (no form values, no tokens).
 */

export type Severity = "info" | "warn" | "error" | "fatal";

const SESSION_KEY = "mh_session_id";

/** Stable per browser-tab session; stitches anonymous → signed-in journeys. */
export const getSessionId = (): string => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Private mode / storage disabled — fall back to a per-load id.
    return `s_nostore_${Date.now()}`;
  }
};

// Collapse duplicate events (e.g. a render loop throwing the same error) so a
// single fault can't flood the table.
const recent = new Map<string, number>();
const DEDUPE_MS = 10_000;

const isDuplicate = (key: string): boolean => {
  const now = Date.now();
  const last = recent.get(key);
  if (last && now - last < DEDUPE_MS) return true;
  recent.set(key, now);
  if (recent.size > 100) {
    for (const [k, t] of recent) if (now - t > DEDUPE_MS) recent.delete(k);
  }
  return false;
};

export const track = async (
  eventType: string,
  context: Record<string, unknown> = {},
  severity: Severity = "info",
): Promise<void> => {
  try {
    if (isDuplicate(`${eventType}:${JSON.stringify(context).slice(0, 120)}`)) return;

    const { data } = await supabase.auth.getSession();
    await supabase.from("platform_events").insert({
      user_id: data?.session?.user?.id ?? null,
      session_id: getSessionId(),
      event_type: eventType,
      severity,
      page: typeof location !== "undefined" ? location.pathname : null,
      context,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    });
  } catch {
    // Swallow — observability must never break the product.
  }
};

/** Convenience wrapper so error call sites read clearly. */
export const trackError = (
  eventType: string,
  error: unknown,
  extra: Record<string, unknown> = {},
) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack?.slice(0, 1000) : undefined;
  return track(eventType, { message, stack, ...extra }, "error");
};

let globalHandlersInstalled = false;

/**
 * Capture crashes React's error boundary cannot see: errors thrown outside
 * render (event handlers, async code) and unhandled promise rejections — the
 * usual cause of "it just doesn't work on my phone" with nothing in the UI.
 */
export const installGlobalErrorTracking = () => {
  if (globalHandlersInstalled || typeof window === "undefined") return;
  globalHandlersInstalled = true;

  window.addEventListener("error", (e) => {
    void track(
      "client.uncaught_error",
      { message: e.message, source: e.filename, line: e.lineno, col: e.colno },
      "error",
    );
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = (e as PromiseRejectionEvent).reason;
    void track(
      "client.unhandled_rejection",
      { message: reason instanceof Error ? reason.message : String(reason) },
      "error",
    );
  });
};
