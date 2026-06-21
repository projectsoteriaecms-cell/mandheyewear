/**
 * T10 — Ledger idempotency + double-send prevention tests
 *
 * These tests verify the contract layer:
 *   - The sent_ledger dedup key is (campaign_run_id, contact_email)
 *   - crm_get_unsent_batch subtracts already-sent emails from the segment
 *   - writeLedger is idempotent on duplicate (ON CONFLICT DO NOTHING)
 *   - Circuit breaker trips cause campaign pause, not retry loop
 *
 * All tests use in-memory mocks — no real DB or network calls.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Types mirroring the EF's internal structures ──────────────────────────────

interface LedgerEntry {
  campaign_run_id:   string;
  contact_email:     string;
  resend_message_id: string | null;
}

interface Recipient {
  email:     string;
  full_name: string | null;
}

// ── In-memory ledger (mirrors ON CONFLICT DO NOTHING behaviour) ───────────────

class InMemoryLedger {
  private rows = new Map<string, LedgerEntry>();

  private key(runId: string, email: string) {
    return `${runId}::${email.toLowerCase().trim()}`;
  }

  insert(runId: string, recipients: Recipient[], messageIds: (string | null)[]) {
    let inserted = 0;
    for (let i = 0; i < recipients.length; i++) {
      const k = this.key(runId, recipients[i].email);
      if (!this.rows.has(k)) {
        this.rows.set(k, {
          campaign_run_id:   runId,
          contact_email:     recipients[i].email.toLowerCase().trim(),
          resend_message_id: messageIds[i] ?? null,
        });
        inserted++;
      }
      // ON CONFLICT DO NOTHING → skip if already present
    }
    return inserted;
  }

  getUnsent(runId: string, allContacts: Recipient[]): Recipient[] {
    return allContacts.filter(
      (r) => !this.rows.has(this.key(runId, r.email)),
    );
  }

  size() { return this.rows.size; }
  clear() { this.rows.clear(); }
}

// ── Test data ─────────────────────────────────────────────────────────────────

const RUN_ID = "run-aaaabbbb-1111";
const contacts: Recipient[] = Array.from({ length: 100 }, (_, i) => ({
  email:     `user${i + 1}@clinic.test`,
  full_name: `User ${i + 1}`,
}));

// ── Ledger idempotency ────────────────────────────────────────────────────────

describe("InMemoryLedger (contract model)", () => {
  let ledger: InMemoryLedger;
  beforeEach(() => { ledger = new InMemoryLedger(); });

  it("inserts new recipients and returns correct count", () => {
    const batch = contacts.slice(0, 10);
    const ids   = batch.map((_, i) => `msg-${i}`);
    expect(ledger.insert(RUN_ID, batch, ids)).toBe(10);
    expect(ledger.size()).toBe(10);
  });

  it("second insert of same batch → 0 new rows (ON CONFLICT DO NOTHING)", () => {
    const batch = contacts.slice(0, 10);
    const ids   = batch.map((_, i) => `msg-${i}`);
    ledger.insert(RUN_ID, batch, ids);
    expect(ledger.insert(RUN_ID, batch, ids)).toBe(0);
    expect(ledger.size()).toBe(10);
  });

  it("overlapping batches: only truly new emails are inserted", () => {
    const firstBatch  = contacts.slice(0, 30);
    const secondBatch = contacts.slice(20, 50); // 20–29 overlap
    ledger.insert(RUN_ID, firstBatch,  firstBatch.map((_, i)  => `msg-a${i}`));
    const n = ledger.insert(RUN_ID, secondBatch, secondBatch.map((_, i) => `msg-b${i}`));
    expect(n).toBe(20);              // only 30-49 are new
    expect(ledger.size()).toBe(50);
  });

  it("email normalisation: upper-case email same as lower-case", () => {
    const upper = [{ email: "USER1@CLINIC.TEST", full_name: "User 1" }];
    const lower = [{ email: "user1@clinic.test", full_name: "User 1" }];
    ledger.insert(RUN_ID, upper, ["msg-u"]);
    expect(ledger.insert(RUN_ID, lower, ["msg-l"])).toBe(0);
  });

  it("email normalisation: whitespace is trimmed", () => {
    const spaces = [{ email: "  user2@clinic.test  ", full_name: "User 2" }];
    ledger.insert(RUN_ID, spaces, ["msg-s"]);
    expect(ledger.insert(RUN_ID, [contacts[1]], ["msg-2"])).toBe(0);
  });

  it("different run IDs have independent ledgers", () => {
    const batch = contacts.slice(0, 5);
    ledger.insert("run-A", batch, batch.map(() => null));
    expect(ledger.insert("run-B", batch, batch.map(() => null))).toBe(5);
    expect(ledger.size()).toBe(10);
  });
});

// ── getUnsent batch logic ─────────────────────────────────────────────────────

describe("getUnsent (crm_get_unsent_batch contract)", () => {
  let ledger: InMemoryLedger;
  beforeEach(() => { ledger = new InMemoryLedger(); });

  it("returns all contacts when ledger is empty", () => {
    expect(ledger.getUnsent(RUN_ID, contacts.slice(0, 10)).length).toBe(10);
  });

  it("subtracts already-sent contacts", () => {
    const sent   = contacts.slice(0, 40);
    const unsent = contacts.slice(0, 60);
    ledger.insert(RUN_ID, sent, sent.map(() => null));
    expect(ledger.getUnsent(RUN_ID, unsent).length).toBe(20);
  });

  it("returns empty when entire segment is in ledger", () => {
    ledger.insert(RUN_ID, contacts, contacts.map(() => null));
    expect(ledger.getUnsent(RUN_ID, contacts).length).toBe(0);
  });

  it("batch of 50 after 75 sent from 100 → returns last 25", () => {
    const sent = contacts.slice(0, 75);
    ledger.insert(RUN_ID, sent, sent.map(() => null));
    // Simulate LIMIT 50: take at most 50 of the unsent
    const unsent = ledger.getUnsent(RUN_ID, contacts).slice(0, 50);
    expect(unsent.length).toBe(25);
  });
});

// ── Crash-resume simulation ───────────────────────────────────────────────────

describe("crash and resume (ledger prevents re-sending)", () => {
  it("EF crash after 25/50: resume sends exactly the remaining 25", () => {
    const ledger    = new InMemoryLedger();
    const campaign  = contacts.slice(0, 50);
    const BATCH     = 25;

    // First invocation: sends 25 then "crashes"
    const firstBatch = campaign.slice(0, BATCH);
    ledger.insert(RUN_ID, firstBatch, firstBatch.map((_, i) => `msg-a${i}`));

    // Second invocation: claims from ledger
    const remaining = ledger.getUnsent(RUN_ID, campaign).slice(0, BATCH);
    expect(remaining.length).toBe(25);
    // Verify these are exactly emails 26-50
    expect(remaining[0].email).toBe("user26@clinic.test");
    expect(remaining[24].email).toBe("user50@clinic.test");
  });

  it("EF crash twice: third invocation still converges to completion", () => {
    const ledger   = new InMemoryLedger();
    const campaign = contacts.slice(0, 90);
    const BATCH    = 30;

    // Three crashes at 30, 60, 90
    for (let run = 0; run < 3; run++) {
      const unsent = ledger.getUnsent(RUN_ID, campaign).slice(0, BATCH);
      if (unsent.length === 0) break;
      ledger.insert(RUN_ID, unsent, unsent.map((_, i) => `msg-${run}-${i}`));
    }

    expect(ledger.size()).toBe(90);
    expect(ledger.getUnsent(RUN_ID, campaign).length).toBe(0);
  });
});

// ── Circuit breaker model ─────────────────────────────────────────────────────

describe("circuit breaker pause contract", () => {
  type CircuitState = "closed" | "open" | "half_open";

  class CircuitBreaker {
    state: CircuitState = "closed";
    failures = 0;
    readonly threshold = 3;
    readonly cooldownMs = 30 * 60 * 1000;
    openedAt: number | null = null;

    recordFailure(now = Date.now()) {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.state    = "open";
        this.openedAt = now;
      }
    }

    recordSuccess() {
      this.failures = 0;
      this.state    = "closed";
      this.openedAt = null;
    }

    isOpen(now = Date.now()): boolean {
      if (this.state === "open") {
        if (this.openedAt && now - this.openedAt > this.cooldownMs) {
          this.state = "half_open";
          return false;
        }
        return true;
      }
      return false;
    }
  }

  it("opens after 3 failures", () => {
    const cb = new CircuitBreaker();
    cb.recordFailure(); expect(cb.state).toBe("closed");
    cb.recordFailure(); expect(cb.state).toBe("closed");
    cb.recordFailure(); expect(cb.state).toBe("open");
  });

  it("isOpen() returns true immediately after opening", () => {
    const cb = new CircuitBreaker();
    cb.recordFailure(); cb.recordFailure(); cb.recordFailure();
    expect(cb.isOpen()).toBe(true);
  });

  it("transitions to half_open after cooldown", () => {
    const cb  = new CircuitBreaker();
    const t0  = 1_000_000;
    cb.recordFailure(t0); cb.recordFailure(t0); cb.recordFailure(t0);
    expect(cb.isOpen(t0 + 31 * 60 * 1000)).toBe(false);
    expect(cb.state).toBe("half_open");
  });

  it("success resets to closed", () => {
    const cb = new CircuitBreaker();
    cb.recordFailure(); cb.recordFailure(); cb.recordFailure();
    cb.recordSuccess();
    expect(cb.state).toBe("closed");
    expect(cb.failures).toBe(0);
  });
});
