/**
 * T10 — Svix webhook signature verification tests
 *
 * Tests the portable verifySvixSignature function (extracted from the
 * resend-webhook Edge Function) using the Node.js Web Crypto API.
 *
 * All tests use an injectable `nowSeconds` so timestamp windows are
 * fully deterministic.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { verifySvixSignature, type SvixHeaders } from "../svix-verify";

// ── Test fixture helpers ─────────────────────────────────────────────────────

const TEST_SECRET = "whsec_MfKQ9r8GKYqrTwjUPZB8TDgoa8NxPJDqKf8VB4EUQFM=";
const RAW_SECRET  = "MfKQ9r8GKYqrTwjUPZB8TDgoa8NxPJDqKf8VB4EUQFM=";

async function buildValidHeaders(
  msgId:    string,
  ts:       number,
  body:     string,
  secret:   string = TEST_SECRET,
): Promise<SvixHeaders> {
  // Derive the correct signature so tests can request a valid sig
  const keyBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, "")), (c) => c.charCodeAt(0));
  const key      = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const content  = `${msgId}.${ts}.${body}`;
  const sigBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(content));
  const sig      = `v1,${btoa(String.fromCharCode(...new Uint8Array(sigBytes)))}`;

  return {
    "svix-id":        msgId,
    "svix-timestamp": String(ts),
    "svix-signature": sig,
  };
}

const NOW = 1_700_000_000; // arbitrary fixed unix timestamp
const BODY = JSON.stringify({ type: "email.delivered", data: { email_id: "abc123" } });

// ── Valid signatures ──────────────────────────────────────────────────────────

describe("valid signatures", () => {
  it("accepts a freshly-generated valid signature", async () => {
    const headers = await buildValidHeaders("msg_1", NOW, BODY);
    const result  = await verifySvixSignature(BODY, headers, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: true });
  });

  it("accepts a secret WITHOUT the whsec_ prefix", async () => {
    const headers = await buildValidHeaders("msg_1", NOW, BODY, `whsec_${RAW_SECRET}`);
    const result  = await verifySvixSignature(BODY, headers, RAW_SECRET, NOW);
    expect(result).toEqual({ ok: true });
  });

  it("accepts when multiple space-separated sigs are present and one matches", async () => {
    const headers     = await buildValidHeaders("msg_2", NOW, BODY);
    const fakeSig     = "v1,ZZZfakesignatureZZZ==";
    const multiSig    = {
      ...headers,
      "svix-signature": `${fakeSig} ${headers["svix-signature"]}`,
    };
    const result = await verifySvixSignature(BODY, multiSig, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: true });
  });

  it("accepts timestamp exactly 299 seconds in the past (within window)", async () => {
    const headers = await buildValidHeaders("msg_3", NOW - 299, BODY);
    const result  = await verifySvixSignature(BODY, headers, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: true });
  });

  it("accepts timestamp exactly 299 seconds in the future (within window)", async () => {
    const headers = await buildValidHeaders("msg_4", NOW + 299, BODY);
    const result  = await verifySvixSignature(BODY, headers, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: true });
  });
});

// ── Stale timestamps ─────────────────────────────────────────────────────────

describe("stale timestamps (replay protection)", () => {
  it("accepts timestamp exactly 300 seconds in the past (edge of window)", async () => {
    const headers = await buildValidHeaders("msg_5", NOW - 300, BODY);
    const result  = await verifySvixSignature(BODY, headers, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: true });
  });

  it("rejects timestamp exactly 301 seconds in the past (just outside window)", async () => {
    const headers = await buildValidHeaders("msg_5b", NOW - 301, BODY);
    const result  = await verifySvixSignature(BODY, headers, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "stale_timestamp" });
  });

  it("rejects timestamp 1 hour in the past", async () => {
    const headers = await buildValidHeaders("msg_6", NOW - 3600, BODY);
    const result  = await verifySvixSignature(BODY, headers, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "stale_timestamp" });
  });

  it("rejects timestamp 1 day in the future (pre-deliver replay)", async () => {
    const headers = await buildValidHeaders("msg_7", NOW + 86400, BODY);
    const result  = await verifySvixSignature(BODY, headers, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "stale_timestamp" });
  });

  it("rejects non-numeric timestamp", async () => {
    const headers = await buildValidHeaders("msg_8", NOW, BODY);
    const result  = await verifySvixSignature(BODY, {
      ...headers,
      "svix-timestamp": "not-a-number",
    }, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "stale_timestamp" });
  });
});

// ── Signature mismatches ──────────────────────────────────────────────────────

describe("signature mismatches", () => {
  it("rejects wrong secret", async () => {
    const wrongSecret = "whsec_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    const headers     = await buildValidHeaders("msg_9", NOW, BODY);
    const result      = await verifySvixSignature(BODY, headers, wrongSecret, NOW);
    expect(result).toEqual({ ok: false, reason: "signature_mismatch" });
  });

  it("rejects tampered body (one char changed)", async () => {
    const headers     = await buildValidHeaders("msg_10", NOW, BODY);
    const tamperedBody = BODY.replace('"type"', '"type2"');
    const result      = await verifySvixSignature(tamperedBody, headers, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "signature_mismatch" });
  });

  it("rejects when only the fake sig is in the header (not the real one)", async () => {
    const headers = await buildValidHeaders("msg_11", NOW, BODY);
    const result  = await verifySvixSignature(BODY, {
      ...headers,
      "svix-signature": "v1,ZZZfakesignatureZZZ==",
    }, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "signature_mismatch" });
  });

  it("rejects empty svix-signature header", async () => {
    const headers = await buildValidHeaders("msg_12", NOW, BODY);
    const result  = await verifySvixSignature(BODY, {
      ...headers,
      "svix-signature": "",
    }, TEST_SECRET, NOW);
    // empty string → missing header guard fires first
    expect(result.ok).toBe(false);
  });

  it("rejects completely wrong signature format (no v1, prefix)", async () => {
    const headers = await buildValidHeaders("msg_13", NOW, BODY);
    const result  = await verifySvixSignature(BODY, {
      ...headers,
      "svix-signature": "somethingelse",
    }, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "signature_mismatch" });
  });
});

// ── Missing headers ───────────────────────────────────────────────────────────

describe("missing required headers", () => {
  it("rejects null svix-id", async () => {
    const headers = await buildValidHeaders("msg_14", NOW, BODY);
    const result  = await verifySvixSignature(BODY, { ...headers, "svix-id": null }, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "missing_svix_id" });
  });

  it("rejects null svix-timestamp", async () => {
    const headers = await buildValidHeaders("msg_15", NOW, BODY);
    const result  = await verifySvixSignature(BODY, { ...headers, "svix-timestamp": null }, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "missing_svix_timestamp" });
  });

  it("rejects null svix-signature", async () => {
    const headers = await buildValidHeaders("msg_16", NOW, BODY);
    const result  = await verifySvixSignature(BODY, { ...headers, "svix-signature": null }, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "missing_svix_signature" });
  });

  it("rejects undefined svix-id", async () => {
    const headers = await buildValidHeaders("msg_17", NOW, BODY);
    const result  = await verifySvixSignature(BODY, { ...headers, "svix-id": undefined }, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: false, reason: "missing_svix_id" });
  });
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("empty body still verifiable", async () => {
    const headers = await buildValidHeaders("msg_18", NOW, "");
    const result  = await verifySvixSignature("", headers, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: true });
  });

  it("large body (50 KB) still verifiable", async () => {
    const bigBody  = JSON.stringify({ data: "x".repeat(50_000) });
    const headers  = await buildValidHeaders("msg_19", NOW, bigBody);
    const result   = await verifySvixSignature(bigBody, headers, TEST_SECRET, NOW);
    expect(result).toEqual({ ok: true });
  });

  it("signature is case-sensitive (altered case → rejected)", async () => {
    const headers  = await buildValidHeaders("msg_20", NOW, BODY);
    const upperSig = headers["svix-signature"]!.toUpperCase();
    const result   = await verifySvixSignature(BODY, {
      ...headers,
      "svix-signature": upperSig,
    }, TEST_SECRET, NOW);
    // Upper-cased base64 won't match
    expect(result.ok).toBe(false);
  });
});
