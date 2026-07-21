import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const LIVE_REFETCH_MS = 15_000;

export interface PlatformEvent {
  id: string;
  event_type: string;
  severity: "info" | "warn" | "error" | "fatal";
  page: string | null;
  session_id: string;
  user_id: string | null;
  context: Record<string, unknown>;
  created_at: string;
}

export interface ErrorGroup {
  event_type: string;
  severity: string;
  message: string | null;
  occurrences: number;
  sessions_affected: number;
  last_seen: string;
}

const FUNNEL_STEPS = [
  { key: "signup.submitted", label: "Signup started" },
  { key: "signup.succeeded", label: "Signup succeeded" },
  { key: "email.verify_succeeded", label: "Email verified" },
  { key: "login.succeeded", label: "Logged in" },
] as const;

/** Live activity feed: most recent touchpoints across the platform. */
export const useLiveActivity = (limit = 60) =>
  useQuery({
    queryKey: ["observability", "activity", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_events")
        .select("id, event_type, severity, page, session_id, user_id, context, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as PlatformEvent[];
    },
    refetchInterval: LIVE_REFETCH_MS,
  });

/** Errors grouped by type+message, most recent first, with blast radius. */
export const useErrorFeed = () =>
  useQuery({
    queryKey: ["observability", "errors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_recent_errors")
        .select("*")
        .order("last_seen", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as ErrorGroup[];
    },
    refetchInterval: LIVE_REFETCH_MS,
  });

/** Signup -> verify -> login funnel over the last 7 days. */
export const useSignupFunnel = () =>
  useQuery({
    queryKey: ["observability", "funnel"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("platform_events")
        .select("event_type")
        .in(
          "event_type",
          FUNNEL_STEPS.map((s) => s.key),
        )
        .gte("created_at", since);
      if (error) throw error;

      const counts = new Map<string, number>();
      for (const row of data ?? []) {
        counts.set(row.event_type, (counts.get(row.event_type) ?? 0) + 1);
      }

      return FUNNEL_STEPS.map((step) => ({
        ...step,
        count: counts.get(step.key) ?? 0,
      }));
    },
    refetchInterval: LIVE_REFETCH_MS,
  });

/** Email delivery health from the auth-email-hook audit trail. */
export const useEmailHealth = () =>
  useQuery({
    queryKey: ["observability", "email"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("email_send_log")
        .select("status, template_name, recipient_email, error_message, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      const rows = data ?? [];
      const counts: Record<string, number> = {};
      for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;

      return {
        counts,
        total: rows.length,
        recent: rows.slice(0, 15),
      };
    },
    refetchInterval: LIVE_REFETCH_MS,
  });

/** Errors in the last 24h, for the top summary strip. */
export const useErrorCount24h = () =>
  useQuery({
    queryKey: ["observability", "error-count-24h"],
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from("platform_events")
        .select("id", { count: "exact", head: true })
        .in("severity", ["error", "fatal"])
        .gte("created_at", since);
      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: LIVE_REFETCH_MS,
  });

/** Distinct sessions seen in the last 24h — a rough active-visitor proxy. */
export const useActiveSessions24h = () =>
  useQuery({
    queryKey: ["observability", "sessions-24h"],
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("platform_events")
        .select("session_id")
        .gte("created_at", since)
        .limit(5000);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.session_id)).size;
    },
    refetchInterval: LIVE_REFETCH_MS,
  });
