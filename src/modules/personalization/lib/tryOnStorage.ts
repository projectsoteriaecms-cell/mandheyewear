/**
 * Try-on result storage.
 *
 * Images only ever land here once a visitor gives a contact -- an anonymous
 * try-on that never converts stores nothing, so cost tracks leads rather than
 * curiosity. See the 20260722_tryon_result_storage migration for the tiering.
 *
 * The bucket is private. Delivery (Resend / Twilio) fetches through a
 * short-lived signed URL rather than a public one, because these are personal
 * photographs of someone's face.
 */

import { supabase } from "@/integrations/supabase/client";

const BUCKET = "try-on-results";

/** Lead images are disposable follow-up context, not an archive. */
const LEAD_RETENTION_DAYS = 60;

export interface StoredTryOnImage {
  path: string;
  expiresAt: string | null;
}

/**
 * Uploads a try-on result and returns its storage path.
 *
 * Deliberately does NOT sign the URL here. The bucket's SELECT policies allow
 * only staff or the owning signed-in user, so an anonymous visitor cannot read
 * back even their own upload -- createSignedUrl returns "Object not found".
 * Signing belongs on the server: the delivery Edge Function holds the service
 * role, signs the path, and the URL never passes through the browser.
 *
 * Returns null if anything fails -- callers fall back to their existing
 * behaviour so a storage outage never costs a visitor their result or drops
 * a captured lead.
 */
export const uploadTryOnResult = async (
  imageDataUrl: string,
  opts: { userId?: string | null; sessionId: string; frameId?: string | null },
): Promise<StoredTryOnImage | null> => {
  try {
    const blob = dataUrlToBlob(imageDataUrl);
    if (!blob) return null;

    // Signed-in users get their own folder so the owner-select RLS policy can
    // match on it; anonymous visitors are namespaced by session instead.
    const folder = opts.userId ?? `anon/${opts.sessionId}`;
    const frameSuffix = opts.frameId ? `-${opts.frameId}` : "";
    const path = `${folder}/${Date.now()}${frameSuffix}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: false });

    if (uploadError) {
      console.error("[tryOnStorage] upload failed:", uploadError.message);
      return null;
    }

    // Signed-in users keep their history; anonymous leads expire.
    const expiresAt = opts.userId
      ? null
      : new Date(Date.now() + LEAD_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    return { path, expiresAt };
  } catch (err) {
    console.error("[tryOnStorage] unexpected error:", err);
    return null;
  }
};

/** Browsers give us canvas output as a data URL; storage wants bytes. */
const dataUrlToBlob = (dataUrl: string): Blob | null => {
  const match = /^data:([^;,]+)?(;base64)?,/.exec(dataUrl);
  if (!match) return null;

  const mime = match[1] || "image/jpeg";
  const payload = dataUrl.slice(match[0].length);

  if (match[2]) {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  return new Blob([decodeURIComponent(payload)], { type: mime });
};
