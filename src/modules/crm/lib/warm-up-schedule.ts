/**
 * Resend domain warm-up schedule — pure TypeScript.
 *
 * This logic mirrors the PostgreSQL schedule seeded in migration 000009.
 * Keeping it here lets us unit-test it without a database, and the
 * React-side useSendQuotaStatus hook can also display the "N days left
 * until next quota increase" without an extra RPC.
 */

export interface WarmUpTier {
  dayFrom:    number;
  dayTo:      number;
  dailyLimit: number;
}

/** The standard sending domain warm-up schedule (conservative). */
export const WARM_UP_SCHEDULE: readonly WarmUpTier[] = [
  { dayFrom: 1,  dayTo: 2,    dailyLimit: 50    },
  { dayFrom: 3,  dayTo: 5,    dailyLimit: 200   },
  { dayFrom: 6,  dayTo: 10,   dailyLimit: 500   },
  { dayFrom: 11, dayTo: 20,   dailyLimit: 2_000 },
  { dayFrom: 21, dayTo: 30,   dailyLimit: 5_000 },
  { dayFrom: 31, dayTo: 9999, dailyLimit: 10_000 },
] as const;

/**
 * Returns the daily email quota for warm-up `day` (1-indexed).
 * Day 1 = the very first day a campaign email was ever sent from this domain.
 * Returns 10_000 for any day beyond the schedule.
 */
export function getQuotaForDay(day: number): number {
  if (day < 1) throw new RangeError(`warm-up day must be ≥ 1, got ${day}`);
  const tier = WARM_UP_SCHEDULE.find((t) => day >= t.dayFrom && day <= t.dayTo);
  return tier?.dailyLimit ?? 10_000;
}

/**
 * Calculates which warm-up day we are on (1-indexed).
 *
 * @param startDate  UTC date of the first-ever send (day 1)
 * @param today      UTC date to calculate for (defaults to now)
 */
export function calcWarmUpDay(startDate: Date, today: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const startUtc = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const delta = Math.round((todayUtc - startUtc) / msPerDay);
  return Math.max(1, delta + 1);  // +1 because day 1 = start date itself
}

/**
 * Returns the next tier's daily limit (or null if already at max).
 * Useful for UI: "Quota increases to X on day N".
 */
export function nextTierInfo(day: number): { limit: number; onDay: number } | null {
  const currentIdx = WARM_UP_SCHEDULE.findIndex(
    (t) => day >= t.dayFrom && day <= t.dayTo,
  );
  if (currentIdx === -1 || currentIdx === WARM_UP_SCHEDULE.length - 1) return null;
  const next = WARM_UP_SCHEDULE[currentIdx + 1];
  return { limit: next.dailyLimit, onDay: next.dayFrom };
}
