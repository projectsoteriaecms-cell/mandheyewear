import { Copy, Check, RefreshCw, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useEmailPreferenceStats } from "../hooks/useEmailPreferences";

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(n: number, total: number): string {
  if (!total) return "—";
  return `${Math.round((n / total) * 100)}%`;
}

function Bar({ value, max }: { value: number; max: number }) {
  const w = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1.5">
      <div
        className="h-full rounded-full bg-teal-500 transition-all"
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PreferenceCenterStats() {
  const { data: stats, isLoading, error, refetch, isFetching } = useEmailPreferenceStats();

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 animate-pulse">
        <div className="h-4 w-40 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4 flex-none" />
        Failed to load preference stats
      </div>
    );
  }

  if (!stats?.length) return null;

  const totalEligible     = stats[0]?.total_eligible     ?? 0;
  const unsubscribedTotal = stats[0]?.unsubscribed_total ?? 0;

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Email Preference Centre</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalEligible.toLocaleString()} eligible contacts ·{" "}
            {unsubscribedTotal.toLocaleString()} unsubscribed
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Global unsubscribe banner */}
      {unsubscribedTotal > 0 && (
        <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200/60 dark:border-amber-800/30">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <strong>{pct(unsubscribedTotal, totalEligible + unsubscribedTotal)}</strong>{" "}
            of all known contacts ({unsubscribedTotal.toLocaleString()}) have opted out of all marketing.
          </p>
        </div>
      )}

      {/* Per-category stats */}
      <div className="px-5 py-4 space-y-5">
        {stats.map((row) => {
          // Contacts not yet in the prefs table are effectively opted-in (default = true)
          const tracked    = row.opted_in_count + row.opted_out_count;
          const implicitIn = Math.max(0, totalEligible - tracked);
          const effectiveIn = row.opted_in_count + implicitIn;

          return (
            <div key={row.category_id}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-foreground">
                  {row.category_label}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {effectiveIn.toLocaleString()} / {totalEligible.toLocaleString()}
                  <span className="ml-1 text-teal-600 dark:text-teal-400 font-medium">
                    ({pct(effectiveIn, totalEligible)})
                  </span>
                </span>
              </div>
              <Bar value={effectiveIn} max={totalEligible} />
              {row.opted_out_count > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.opted_out_count.toLocaleString()} explicitly opted out
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PreferenceLinkCopier ──────────────────────────────────────────────────────

interface PreferenceLinkCopierProps {
  /** Pre-fetched preference link URL */
  url: string | undefined;
  isLoading?: boolean;
}

export function PreferenceLinkCopier({ url, isLoading }: PreferenceLinkCopierProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={isLoading ? "Generating link…" : (url ?? "")}
        className="flex-1 rounded border border-input bg-muted/40 px-3 py-1.5 text-xs font-mono text-muted-foreground truncate"
      />
      <button
        type="button"
        onClick={handleCopy}
        disabled={!url || isLoading}
        className="flex items-center gap-1.5 rounded border border-input px-3 py-1.5 text-xs hover:bg-muted transition-colors disabled:opacity-50"
      >
        {copied ? (
          <><Check className="h-3.5 w-3.5 text-green-500" /> Copied</>
        ) : (
          <><Copy className="h-3.5 w-3.5" /> Copy</>
        )}
      </button>
    </div>
  );
}
