/**
 * Svix webhook signature verification — portable Web Crypto implementation.
 *
 * Extracted from supabase/functions/resend-webhook/index.ts so it can be
 * unit-tested in Vitest (Node.js) without the Deno runtime.
 *
 * Algorithm:
 *   signed_content = "{svix-id}.{svix-timestamp}.{raw_body}"
 *   key            = base64_decode(secret.replace("whsec_", ""))
 *   expected_sig   = "v1," + base64_encode(HMAC-SHA256(key, signed_content))
 *   match against any of the space-separated "v1,<b64>" values in svix-signature
 */

export type SvixVerifyResult =
  | { ok: true }
  | { ok: false; reason: SvixRejectReason };

export type SvixRejectReason =
  | "missing_svix_id"
  | "missing_svix_timestamp"
  | "missing_svix_signature"
  | "stale_timestamp"
  | "signature_mismatch"
  | "invalid_secret";

export interface SvixHeaders {
  "svix-id":        string | null | undefined;
  "svix-timestamp": string | null | undefined;
  "svix-signature": string | null | undefined;
}

function b64Decode(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function b64Encode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

/**
 * Verifies a Svix HMAC-SHA256 webhook signature.
 *
 * @param rawBody     Raw request body string (must NOT be JSON.parsed first)
 * @param headers     The three required Svix headers
 * @param secret      Resend webhook signing secret ("whsec_…" or bare base64)
 * @param nowSeconds  Current unix timestamp in seconds (injectable for tests)
 */
export async function verifySvixSignature(
  rawBody:    string,
  headers:    SvixHeaders,
  secret:     string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<SvixVerifyResult> {
  const msgId        = headers["svix-id"];
  const msgTimestamp = headers["svix-timestamp"];
  const msgSig       = headers["svix-signature"];

  if (!msgId)        return { ok: false, reason: "missing_svix_id" };
  if (!msgTimestamp) return { ok: false, reason: "missing_svix_timestamp" };
  if (!msgSig)       return { ok: false, reason: "missing_svix_signature" };

  // Replay protection: reject if timestamp is more than 5 minutes off
  const ts = parseInt(msgTimestamp, 10);
  if (isNaN(ts) || Math.abs(nowSeconds - ts) > 300) {
    return { ok: false, reason: "stale_timestamp" };
  }

  let keyBytes: Uint8Array;
  try {
    keyBytes = b64Decode(secret.replace(/^whsec_/, ""));
  } catch {
    return { ok: false, reason: "invalid_secret" };
  }

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signedContent = `${msgId}.${msgTimestamp}.${rawBody}`;
  const sigBytes      = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(signedContent),
  );
  const expectedSig = `v1,${b64Encode(sigBytes)}`;

  const provided = msgSig.split(" ").map((s) => s.trim()).filter(Boolean);
  if (!provided.includes(expectedSig)) {
    return { ok: false, reason: "signature_mismatch" };
  }

  return { ok: true };
}
