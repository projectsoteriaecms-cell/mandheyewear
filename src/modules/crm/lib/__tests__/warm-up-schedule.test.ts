/**
 * T10 — Warm-up schedule unit tests
 *
 * Pure functions with no DB or network calls.
 */

import { describe, it, expect } from "vitest";
import {
  getQuotaForDay,
  calcWarmUpDay,
  nextTierInfo,
  WARM_UP_SCHEDULE,
} from "../warm-up-schedule";

// ── getQuotaForDay ──────────────────────────────────────────────────────────

describe("getQuotaForDay", () => {
  describe("tier boundaries — exact day values", () => {
    it("day 1  → 50",     () => expect(getQuotaForDay(1)).toBe(50));
    it("day 2  → 50",     () => expect(getQuotaForDay(2)).toBe(50));
    it("day 3  → 200",    () => expect(getQuotaForDay(3)).toBe(200));
    it("day 5  → 200",    () => expect(getQuotaForDay(5)).toBe(200));
    it("day 6  → 500",    () => expect(getQuotaForDay(6)).toBe(500));
    it("day 10 → 500",    () => expect(getQuotaForDay(10)).toBe(500));
    it("day 11 → 2000",   () => expect(getQuotaForDay(11)).toBe(2_000));
    it("day 20 → 2000",   () => expect(getQuotaForDay(20)).toBe(2_000));
    it("day 21 → 5000",   () => expect(getQuotaForDay(21)).toBe(5_000));
    it("day 30 → 5000",   () => expect(getQuotaForDay(30)).toBe(5_000));
    it("day 31 → 10000",  () => expect(getQuotaForDay(31)).toBe(10_000));
    it("day 100 → 10000", () => expect(getQuotaForDay(100)).toBe(10_000));
    it("day 9999 → 10000",() => expect(getQuotaForDay(9999)).toBe(10_000));
  });

  describe("single-day transitions — n and n+1 differ", () => {
    it("day 2→3 crosses 50→200",   () => {
      expect(getQuotaForDay(2)).toBe(50);
      expect(getQuotaForDay(3)).toBe(200);
    });
    it("day 5→6 crosses 200→500",  () => {
      expect(getQuotaForDay(5)).toBe(200);
      expect(getQuotaForDay(6)).toBe(500);
    });
    it("day 10→11 crosses 500→2000", () => {
      expect(getQuotaForDay(10)).toBe(500);
      expect(getQuotaForDay(11)).toBe(2_000);
    });
    it("day 20→21 crosses 2000→5000", () => {
      expect(getQuotaForDay(20)).toBe(2_000);
      expect(getQuotaForDay(21)).toBe(5_000);
    });
    it("day 30→31 crosses 5000→10000", () => {
      expect(getQuotaForDay(30)).toBe(5_000);
      expect(getQuotaForDay(31)).toBe(10_000);
    });
  });

  describe("invalid input", () => {
    it("day 0 throws RangeError",  () => expect(() => getQuotaForDay(0)).toThrow(RangeError));
    it("day -1 throws RangeError", () => expect(() => getQuotaForDay(-1)).toThrow(RangeError));
  });
});

// ── WARM_UP_SCHEDULE invariants ─────────────────────────────────────────────

describe("WARM_UP_SCHEDULE invariants", () => {
  it("tiers are sorted ascending by dayFrom", () => {
    const fromValues = WARM_UP_SCHEDULE.map((t) => t.dayFrom);
    const sorted = [...fromValues].sort((a, b) => a - b);
    expect(fromValues).toEqual(sorted);
  });

  it("no gaps between tiers (dayTo[n] + 1 === dayFrom[n+1])", () => {
    for (let i = 0; i < WARM_UP_SCHEDULE.length - 1; i++) {
      const cur  = WARM_UP_SCHEDULE[i];
      const next = WARM_UP_SCHEDULE[i + 1];
      expect(cur.dayTo + 1).toBe(next.dayFrom);
    }
  });

  it("no overlaps between tiers", () => {
    for (let i = 0; i < WARM_UP_SCHEDULE.length - 1; i++) {
      expect(WARM_UP_SCHEDULE[i].dayTo).toBeLessThan(WARM_UP_SCHEDULE[i + 1].dayFrom);
    }
  });

  it("daily limits strictly increase", () => {
    for (let i = 0; i < WARM_UP_SCHEDULE.length - 1; i++) {
      expect(WARM_UP_SCHEDULE[i].dailyLimit).toBeLessThan(WARM_UP_SCHEDULE[i + 1].dailyLimit);
    }
  });

  it("first tier starts at day 1", () => {
    expect(WARM_UP_SCHEDULE[0].dayFrom).toBe(1);
  });
});

// ── calcWarmUpDay ────────────────────────────────────────────────────────────

describe("calcWarmUpDay", () => {
  const d = (y: number, m: number, day: number) =>
    new Date(Date.UTC(y, m - 1, day));

  it("same day = day 1", () =>
    expect(calcWarmUpDay(d(2026, 1, 1), d(2026, 1, 1))).toBe(1));

  it("next day = day 2", () =>
    expect(calcWarmUpDay(d(2026, 1, 1), d(2026, 1, 2))).toBe(2));

  it("30 days after start = day 31", () =>
    expect(calcWarmUpDay(d(2026, 1, 1), d(2026, 1, 31))).toBe(31));

  it("crosses month boundary correctly", () =>
    expect(calcWarmUpDay(d(2026, 1, 30), d(2026, 2, 1))).toBe(3));

  it("crosses year boundary correctly", () =>
    expect(calcWarmUpDay(d(2025, 12, 31), d(2026, 1, 2))).toBe(3));

  it("today before start clamped to day 1 (never negative)", () =>
    expect(calcWarmUpDay(d(2026, 6, 1), d(2026, 5, 1))).toBe(1));

  it("100 days after start = day 101", () => {
    const start = d(2026, 1, 1);
    const later = new Date(Date.UTC(2026, 0, 1) + 100 * 86400 * 1000);
    expect(calcWarmUpDay(start, later)).toBe(101);
  });
});

// ── nextTierInfo ─────────────────────────────────────────────────────────────

describe("nextTierInfo", () => {
  it("day 1 → next tier is 200 on day 3",   () =>
    expect(nextTierInfo(1)).toEqual({ limit: 200, onDay: 3 }));

  it("day 2 → next tier is 200 on day 3 (still in first tier)", () =>
    expect(nextTierInfo(2)).toEqual({ limit: 200, onDay: 3 }));

  it("day 3 → next tier is 500 on day 6",   () =>
    expect(nextTierInfo(3)).toEqual({ limit: 500, onDay: 6 }));

  it("day 10 → next tier is 2000 on day 11", () =>
    expect(nextTierInfo(10)).toEqual({ limit: 2_000, onDay: 11 }));

  it("day 31 (max tier) → null",             () =>
    expect(nextTierInfo(31)).toBeNull());

  it("day 100 (max tier) → null",            () =>
    expect(nextTierInfo(100)).toBeNull());
});

// ── getQuotaForDay + calcWarmUpDay integration ──────────────────────────────

describe("combined: quota at various real warm-up ages", () => {
  const start = new Date(Date.UTC(2026, 0, 1));

  it("on launch day → 50/day",  () =>
    expect(getQuotaForDay(calcWarmUpDay(start, new Date(Date.UTC(2026, 0, 1))))).toBe(50));

  it("on day 5 → 200/day",      () =>
    expect(getQuotaForDay(calcWarmUpDay(start, new Date(Date.UTC(2026, 0, 5))))).toBe(200));

  it("on day 15 → 2000/day",    () =>
    expect(getQuotaForDay(calcWarmUpDay(start, new Date(Date.UTC(2026, 0, 15))))).toBe(2_000));

  it("after 2 months → 10000/day", () => {
    const twoMonthsLater = new Date(Date.UTC(2026, 2, 1));
    expect(getQuotaForDay(calcWarmUpDay(start, twoMonthsLater))).toBe(10_000);
  });
});
