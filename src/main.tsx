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

createRoot(document.getElementById("root")!).render(<App />);
