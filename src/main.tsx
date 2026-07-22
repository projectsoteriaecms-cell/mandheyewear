// Must be first — backfills runtime APIs missing on older Safari before any
// dependency code runs.
import "./shared/lib/polyfills";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import { installGlobalErrorTracking } from "./shared/lib/telemetry";
import "./index.css";

// Catch errors thrown outside React's render tree (async code, event handlers,
// unhandled rejections) — the class of failure that otherwise leaves no trace.
installGlobalErrorTracking();

// Register the service worker immediately and re-check for a new deploy every
// hour while the app stays open. Long-lived installed PWAs otherwise only
// check on a full navigation, which can leave phones running stale builds.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => registration.update(), 60 * 60 * 1000);
    }
  },
});

// The missing half of "autoUpdate": skipWaiting + clientsClaim make the new
// service worker take control immediately, but a tab that's already open
// keeps running the OLD JS bundle from memory until it reloads -- the update
// happens invisibly and nothing changes on screen until the visitor
// manually refreshes. Reloading once when control actually changes closes
// that gap so a deploy reaches open tabs, not just new page loads. The
// `refreshing` guard stops a double-fire (controllerchange can fire more
// than once) from looping.
if ("serviceWorker" in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
