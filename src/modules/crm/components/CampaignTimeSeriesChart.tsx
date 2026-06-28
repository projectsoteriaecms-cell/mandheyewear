import { memo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useCampaignTimeSeries } from "../hooks/useCampaignAnalytics";

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtBucket(iso: string, bucket: "hour" | "day"): string {
  const d = new Date(iso);
  if (bucket === "day") {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function fmtTooltipLabel(iso: string, bucket: "hour" | "day"): string {
  const d = new Date(iso);
  if (bucket === "day") {
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }
  return d.toLocaleString("en-GB", {
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Chart ─────────────────────────────────────────────────────────────────────

interface Props {
  campaignId: string;
}

function CampaignTimeSeriesChartComponent({ campaignId }: Props) {
  const [bucket, setBucket] = useState<"hour" | "day">("hour");
  const { data, isLoading, error } = useCampaignTimeSeries(campaignId, bucket);

  const chartData = (data ?? []).map((row) => ({
    label:       fmtBucket(row.bucket_start, bucket),
    fullLabel:   fmtTooltipLabel(row.bucket_start, bucket),
    opens:       row.opens,
    clicks:      row.clicks,
    bounces:     row.bounces,
    unsubscribes: row.unsubscribes,
  }));

  const hasData = chartData.length > 0;
  const totalOpens  = data?.reduce((s, r) => s + r.opens,  0) ?? 0;
  const totalClicks = data?.reduce((s, r) => s + r.clicks, 0) ?? 0;

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div>
          <p className="text-sm font-semibold text-foreground">Engagement over time</p>
          {hasData && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalOpens.toLocaleString()} opens · {totalClicks.toLocaleString()} clicks
            </p>
          )}
        </div>
        {/* Hour / Day toggle */}
        <div className="flex gap-1 rounded-md border border-border p-0.5 text-xs">
          {(["hour", "day"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBucket(b)}
              className={[
                "rounded px-2.5 py-1 font-medium transition-colors capitalize",
                bucket === b
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2 pb-4 pt-4">
        {isLoading ? (
          <div className="h-44 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
            Loading chart…
          </div>
        ) : error ? (
          <div className="h-44 flex items-center justify-center text-xs text-destructive">
            Could not load event data.
          </div>
        ) : !hasData ? (
          <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">
            No engagement events yet — data arrives via Resend webhooks when recipients open or click.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={176}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  color: "hsl(var(--foreground))",
                }}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullLabel ?? ""
                }
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />

              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />

              <Area
                type="monotone"
                dataKey="opens"
                name="Opens"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#colorOpens)"
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                name="Clicks"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorClicks)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export const CampaignTimeSeriesChart = memo(CampaignTimeSeriesChartComponent);
