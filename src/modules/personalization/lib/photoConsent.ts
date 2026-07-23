import { track } from "@/shared/lib/telemetry";

/**
 * Photo-usage consent, required once per session before any upload -- shared
 * by every entry point that can produce a try-on photo (the main /try-on
 * upload, the inline product-card modal). A visitor who consents in one
 * surface must not be asked again in another; this is the single source of
 * truth for that sessionStorage flag.
 *
 * Why it exists: a try-on photo is biometric-adjacent personal data, and we
 * cannot verify whose face is in an upload. The self-certification checkbox
 * ("my photo, or I have their permission") plus the tracked consent event
 * (timestamp + session in platform_events) is the audit trail that puts
 * responsibility for third-party photos on the uploader -- NDPA 2023 diligence
 * without adding a second screen to the flow.
 */
export const PHOTO_CONSENT_VERSION = "v1.0";
const PHOTO_CONSENT_KEY = "mh_photo_consent";

export const hasSessionPhotoConsent = (): boolean => {
  try {
    return sessionStorage.getItem(PHOTO_CONSENT_KEY) === PHOTO_CONSENT_VERSION;
  } catch {
    return false;
  }
};

/** Records consent for the rest of this session and logs the audit event. */
export const giveSessionPhotoConsent = (): void => {
  try {
    sessionStorage.setItem(PHOTO_CONSENT_KEY, PHOTO_CONSENT_VERSION);
  } catch {
    // Private mode / storage disabled -- caller's in-memory state still gates.
  }
  void track("tryon.photo_consent_given", { version: PHOTO_CONSENT_VERSION });
};

export const revokeSessionPhotoConsent = (): void => {
  try {
    sessionStorage.removeItem(PHOTO_CONSENT_KEY);
  } catch {
    // ignore
  }
};
