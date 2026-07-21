import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catches render-time crashes so a single failing component shows a readable
 * message instead of unmounting the app to a blank white page — the symptom
 * behind "the site opens for me but not for them".
 *
 * The recovery button clears the service worker and all caches, which is the
 * cure for the most common cause: a device stuck on an outdated cached build.
 * Deliberately plain CSS — the design system itself may be what failed.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed", { error, componentStack: info.componentStack });
  }

  private handleReset = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (e) {
      console.warn("Reset failed, reloading anyway", e);
    }
    window.location.replace("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "Inter, system-ui, -apple-system, Arial, sans-serif",
          background: "#0f1116",
          color: "#e8e8ea",
        }}
      >
        <div style={{ maxWidth: "420px", textAlign: "center" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 10px" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "15px", lineHeight: 1.6, color: "#a7a9b4", margin: "0 0 22px" }}>
            The page didn’t load correctly on this device. Refreshing with a clean copy usually
            fixes it.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              background: "#e8b923",
              color: "#1a1a1a",
              border: "none",
              borderRadius: "10px",
              padding: "13px 26px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              minHeight: "44px",
            }}
          >
            Refresh &amp; fix
          </button>
          <p style={{ fontSize: "12px", color: "#6f7280", margin: "22px 0 0" }}>
            Still stuck? Contact us on WhatsApp and mention this message:
            <br />
            <span style={{ color: "#8b8d98", wordBreak: "break-word" }}>{this.state.message}</span>
          </p>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
