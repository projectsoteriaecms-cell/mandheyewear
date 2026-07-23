import { useSyncExternalStore } from "react";

/**
 * In-memory (never persisted) store for a guest's try-on photo, shared across
 * every "Try On" trigger for the lifetime of this tab. A guest who uploads a
 * photo once, on whichever product they happened to click first, can then try
 * on any other product without re-uploading or being sent back to /try-on --
 * that round trip was the actual friction being solved by adding this.
 *
 * Deliberately module-level memory, not sessionStorage/localStorage: a face
 * photo shouldn't outlive the tab, and a full-resolution base64 photo risks
 * sessionStorage's ~5-10MB quota (shared with everything else on the origin).
 * Cleared on tab close or hard reload by design -- that's a feature here, not
 * a gap, since nothing about a guest's identity should linger on the device.
 */
let sessionPhoto: string | null = null;
const listeners = new Set<() => void>();

export const getSessionTryOnPhoto = (): string | null => sessionPhoto;

export const setSessionTryOnPhoto = (photo: string | null): void => {
  sessionPhoto = photo;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Reactive read -- re-renders every subscribed component when any one of
 *  them (e.g. a different product card's modal) sets the photo. */
export const useSessionTryOnPhoto = (): string | null =>
  useSyncExternalStore(subscribe, getSessionTryOnPhoto, () => null);
