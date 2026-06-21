/**
 * LTV + Cohort Retention Dashboard (T19)
 *
 * Composed of four independent sections:
 *   LtvStatCards        — 4 headline KPIs
 *   MonthlyRevenueChart — Recharts BarChart trailing N months
 *   LtvByChannelTable   — conversion + revenue by acquisition source
 *   CohortRetentionGrid — colour-coded cohort retention matrix
 */

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";
import {
  useLtvSummary,
  useLtvByChannel,
  useMonthlyRevenueTrend,
  useCohortGrid,
} from "../hooks/useLtvAnalytics";
import type { CohortGridRow } from "../hooks/useLtvAnalytics";

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtMoney(v: number | null | undefined): string {
  if (v == null) return "—";
  return "₦" + Math.round(v).toLocaleString();
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return "—";
  return v.toFixed(1) + "%";
}

function fmtMonth(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}

// Heatmap colour: white → teal-ish green, proportional to retention %
function retentionBg(pct: number): string {
  const h = 175; // teal hue
  const s = Math.round(pct * 0.65);
  const l = Math.round(96 - pct * 0.42);
  return `hsl(${h},${s}%,${l}%)`;
}

function retentionFg(pct: number): string {
  return pct >= 50 ? "#0f4d45" : "#374151";
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ h = 4 }: { h?: number }) {
  return (
    <div
      className="animate-pulse rounded bg-muted"
      style={{ height: `${h * 4}px` }}
    />
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 flex-none" />
      {msg}
    </div>
  );
}

// ── 1. LTV Stat Cards ─────────────────────────────────────────────────────────

export function LtvStatCards() {
  const { data, isLoading, error } = useLtvSummary();

  const cards = [
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: isLoading ? null : fmtMoney(data?.total_revenue),
      sub: "all time, paid orders",
      colour: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      icon: Users,
      label: "Conversion Rate",
      value: isLoading ? null : fmtPct(data?.conversion_rate),
      sub: `${data?.converted_count?.toLocaleString() ?? "…"} of ${data?.total_contacts?.toLocaleString() ?? "…"} contacts`,
      colour: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: TrendingUp,
      label: "Avg LTV (buyers)",
      value: isLoading ? null : fmtMoney(data?.avg_ltv_converted),
      sub: `median ${fmtMoney(data?.median_ltv)}`,
      colour: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
    {
      icon: ShoppingBag,
      label: "Top 10% LTV",
      value: isLoading ? null : fmtMoney(data?.p90_ltv),
      sub: "90th percentile threshold",
      colour: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  if (error) return <ErrorBanner msg="Failed to load LTV summary" />;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ icon: Icon, label, value, sub, colour, bg }) => (
        <div key={label} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${bg} mb-3`}>
            <Icon className={`h-4 w-4 ${colour}`} />
          </div>
          <p className="text-xs text-muted-foreground">{label}</p>
          {isLoading ? (
            <div className="mt-1"><Skeleton h={5} /></div>
          ) : (
            <p className="mt-0.5 text-xl font-bold text-foreground tabular-nums">{value}</p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── 2. Monthly Revenue Chart ──────────────────────────────────────────────────

export function MonthlyRevenueChart({ months = 12 }: { months?: number }) {
  const { data, isLoading, error } = useMonthlyRevenueTrend(months);

  if (error) return <ErrorBanner msg="Failed to load revenue trend" />;

  const chartData = (data ?? []).map((row) => ({
    month:        fmtMonth(row.month),
    Revenue:      row.revenue,
    "New Buyers": row.new_customers,
  }));

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-1">Monthly Revenue</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Trailing {months} months — paid orders
      </p>

      {isLoading ? (
        <Skeleton h={48} />
      ) : chartData.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No order data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => "₦" + (v / 1000).toFixed(0) + "k"}
            />
            <Tooltip
              formatter={(value: number, name: string) =>
                name === "Revenue" ? [fmtMoney(value), name] : [value.toLocaleString(), name]
              }
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
              }}
            />
            <Legend
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Bar dataKey="Revenue"      fill="#0e7490" radius={[3, 3, 0, 0]} maxBarSize={32} />
            <Bar dataKey="New Buyers"   fill="#a78bfa" radius={[3, 3, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── 3. LTV by Channel ─────────────────────────────────────────────────────────

export function LtvByChannelTable() {
  const { data, isLoading, error } = useLtvByChannel();

  if (error) return <ErrorBanner msg="Failed to load channel data" />;

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60">
        <h3 className="text-sm font-semibold text-foreground">LTV by Acquisition Channel</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Contacts grouped by first-touch source
        </p>
      </div>

      {isLoading ? (
        <div className="p-5 space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} h={8} />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Channel</th>
                <th className="px-3 py-3 text-right font-medium">Contacts</th>
                <th className="px-3 py-3 text-right font-medium">Converted</th>
                <th className="px-3 py-3 text-right font-medium">Conv. Rate</th>
                <th className="px-3 py-3 text-right font-medium">Avg LTV</th>
                <th className="px-5 py-3 text-right font-medium">Total Rev.</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row) => (
                <tr
                  key={row.channel}
                  className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-foreground">{row.channel}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                    {row.contact_count.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                    {row.converted_count.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    <span
                      className={[
                        "font-medium",
                        row.conversion_rate >= 20
                          ? "text-emerald-600 dark:text-emerald-400"
                          : row.conversion_rate >= 10
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {fmtPct(row.conversion_rate)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-foreground">
                    {fmtMoney(row.avg_ltv)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-foreground">
                    {fmtMoney(row.total_revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── 4. Cohort Retention Grid ──────────────────────────────────────────────────

function buildMatrix(
  rows: CohortGridRow[],
): { cohorts: string[]; maxMonths: number; map: Map<string, CohortGridRow> } {
  const cohorts  = [...new Set(rows.map((r) => r.cohort_month))].sort().reverse();
  const maxMonths = Math.max(0, ...rows.map((r) => r.months_after));
  const map       = new Map(rows.map((r) => [`${r.cohort_month}:${r.months_after}`, r]));
  return { cohorts, maxMonths, map };
}

export function CohortRetentionGrid({ months = 6 }: { months?: number }) {
  const { data, isLoading, error } = useCohortGrid(months);

  if (error) return <ErrorBanner msg="Failed to load cohort data" />;

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <Skeleton h={6} />
        <div className="mt-4 space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} h={8} />)}
        </div>
      </div>
    );
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-1">Cohort Retention</h3>
        <p className="py-8 text-center text-sm text-muted-foreground">
          Not enough order history to build cohort data yet.
        </p>
      </div>
    );
  }

  const { cohorts, maxMonths, map } = buildMatrix(rows);
  const colHeaders = Array.from({ length: maxMonths + 1 }, (_, i) => i);

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60">
        <h3 className="text-sm font-semibold text-foreground">Cohort Retention</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          % of buyers who re-ordered in subsequent months. Month 0 = first purchase month.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs tabular-nums">
          <thead>
            <tr className="border-b border-border/60 text-muted-foreground">
              <th className="px-4 py-2.5 text-left font-medium w-28 sticky left-0 bg-card z-10">
                Cohort
              </th>
              <th className="px-3 py-2.5 text-right font-medium w-16">Size</th>
              {colHeaders.map((m) => (
                <th key={m} className="px-2 py-2.5 text-center font-medium w-14">
                  M{m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort) => {
              const firstRow = map.get(`${cohort}:0`);
              const size     = firstRow?.cohort_size ?? 0;

              return (
                <tr key={cohort} className="border-b border-border/40">
                  <td className="px-4 py-2 font-medium text-foreground sticky left-0 bg-card">
                    {fmtMonth(cohort)}
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{size}</td>
                  {colHeaders.map((m) => {
                    const cell = map.get(`${cohort}:${m}`);
                    const pct  = cell?.retention_pct ?? null;

                    if (pct === null) {
                      return (
                        <td key={m} className="px-2 py-2 text-center text-muted-foreground/30">
                          —
                        </td>
                      );
                    }

                    return (
                      <td
                        key={m}
                        className="px-2 py-2 text-center font-medium rounded-sm"
                        style={{
                          backgroundColor: retentionBg(pct),
                          color:           retentionFg(pct),
                        }}
                        title={`${cell?.active_count} / ${size} re-ordered`}
                      >
                        {pct.toFixed(0)}%
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-border/40 flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Retention:</span>
        {[0, 25, 50, 75, 100].map((p) => (
          <div key={p} className="flex items-center gap-1">
            <div
              className="h-3 w-5 rounded-sm"
              style={{ backgroundColor: retentionBg(p) }}
            />
            <span className="text-xs text-muted-foreground">{p}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main container ────────────────────────────────────────────────────────────

export function LtvDashboard() {
  const [trendMonths, setTrendMonths] = useState(12);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <LtvStatCards />

      {/* Revenue trend */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground" />
          <select
            value={trendMonths}
            onChange={(e) => setTrendMonths(Number(e.target.value))}
            className="h-7 rounded border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
          </select>
        </div>
        <MonthlyRevenueChart months={trendMonths} />
      </div>

      {/* Channel breakdown */}
      <LtvByChannelTable />

      {/* Cohort grid */}
      <CohortRetentionGrid months={6} />
    </div>
  );
}
