/**
 * Persistent circuit breaker for the Resend email API.
 *
 * State machine:  closed → open (after FAILURE_THRESHOLD failures)
 *                 open   → half_open (after COOLDOWN_MS elapses)
 *                 half_open → closed (on success) | open (on failure)
 *
 * Backed by crm_service_health (Supabase, service-role access).
 * All DB errors fail-open so a broken DB never blocks users.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

type CBState = "closed" | "open" | "half_open";

interface ServiceHealth {
  service_name: string;
  failure_count: number;
  last_failure_at: string | null;
  tripped_at: string | null;
  state: CBState;
}

function db() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/**
 * Check whether a call to the service is permitted.
 * Returns { allowed: true } or { allowed: false, reason: string }.
 */
export async function checkCircuit(
  service: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const { data, error } = await db()
    .from("crm_service_health")
    .select("state, failure_count, tripped_at")
    .eq("service_name", service)
    .maybeSingle();

  if (error) {
    // Fail-open: DB error must not block users
    console.error(`circuit-breaker[${service}]: DB read error — failing open:`, error.message);
    return { allowed: true };
  }

  if (!data || data.state === "closed") return { allowed: true };

  if (data.state === "open") {
    const trippedAt = data.tripped_at ? new Date(data.tripped_at).getTime() : 0;
    const elapsed = Date.now() - trippedAt;
    if (elapsed >= COOLDOWN_MS) {
      // Transition to half-open and allow the probe call
      await db()
        .from("crm_service_health")
        .update({ state: "half_open", updated_at: new Date().toISOString() })
        .eq("service_name", service);
      return { allowed: true };
    }
    const remainingMin = Math.ceil((COOLDOWN_MS - elapsed) / 60_000);
    return {
      allowed: false,
      reason: `Resend circuit open — cooldown ${remainingMin}m remaining (tripped after ${FAILURE_THRESHOLD} failures)`,
    };
  }

  // half_open: let the probe through
  return { allowed: true };
}

/**
 * Record a successful Resend call — resets the breaker to closed.
 */
export async function recordSuccess(service: string): Promise<void> {
  const { error } = await db()
    .from("crm_service_health")
    .upsert(
      {
        service_name: service,
        failure_count: 0,
        last_failure_at: null,
        tripped_at: null,
        state: "closed",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "service_name" },
    );
  if (error) console.error(`circuit-breaker[${service}]: failed to record success:`, error.message);
}

/**
 * Record a Resend failure.
 * Returns { tripped: true } when the threshold is newly crossed.
 */
export async function recordFailure(
  service: string,
): Promise<{ tripped: boolean }> {
  const { data } = await db()
    .from("crm_service_health")
    .select("failure_count, tripped_at")
    .eq("service_name", service)
    .maybeSingle();

  const newCount = ((data as ServiceHealth | null)?.failure_count ?? 0) + 1;
  const justTripped = newCount >= FAILURE_THRESHOLD;
  const now = new Date().toISOString();

  const { error } = await db()
    .from("crm_service_health")
    .upsert(
      {
        service_name: service,
        failure_count: newCount,
        last_failure_at: now,
        tripped_at: justTripped
          ? now
          : ((data as ServiceHealth | null)?.tripped_at ?? null),
        state: justTripped ? "open" : "closed",
        updated_at: now,
      },
      { onConflict: "service_name" },
    );

  if (error) console.error(`circuit-breaker[${service}]: failed to record failure:`, error.message);
  return { tripped: justTripped };
}
