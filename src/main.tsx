// Must be first — backfills runtime APIs missing on older Safari before any
// dependency code runs.
import "./shared/lib/polyfills";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

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
