import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Circle, ExternalLink, RefreshCw } from "lucide-react";
import { RoleGuard } from "@/modules/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QAFeedbackRow {
  id: string;
  created_at: string;
  tester_name: string | null;
  tester_email: string | null;
  page_url: string | null;
  page_title: string | null;
  feedback_type: string;
  star_rating: number | null;
  feedback_text: string;
  resolved: boolean;
  admin_notes: string | null;
}

type FilterType = "all" | "bug" | "suggestion" | "confused" | "praise";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { emoji: string; label: string; badgeClass: string }> = {
  bug:        { emoji: "🐛", label: "Bug",      badgeClass: "bg-red-100   text-red-700   dark:bg-red-950   dark:text-red-400"   },
  confused:   { emoji: "❓", label: "Confused", badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  suggestion: { emoji: "💡", label: "Idea",     badgeClass: "bg-blue-100  text-blue-700  dark:bg-blue-950  dark:text-blue-400"  },
  praise:     { emoji: "🎉", label: "Love it",  badgeClass: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
};

function StarDisplay({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className="text-amber-500 text-sm">
      {"★".repeat(rating)}
      <span className="text-muted-foreground/30">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCards({ rows }: { rows: QAFeedbackRow[] }) {
  const total = rows.length;
  const bugs = rows.filter(r => r.feedback_type === "bug").length;
  const suggestions = rows.filter(r => r.feedback_type === "suggestion").length;
  const confused = rows.filter(r => r.feedback_type === "confused").length;
  const resolved = rows.filter(r => r.resolved).length;
  const avgRating = rows.filter(r => r.star_rating).reduce((s, r) => s + (r.star_rating || 0), 0)
    / (rows.filter(r => r.star_rating).length || 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {[
        { label: "Total",      value: total,          color: "text-foreground"   },
        { label: "Bugs 🐛",    value: bugs,           color: "text-red-600"      },
        { label: "Ideas 💡",   value: suggestions,    color: "text-blue-600"     },
        { label: "Confused ❓", value: confused,       color: "text-amber-600"   },
        { label: "Resolved ✅", value: resolved,       color: "text-green-600"   },
        { label: "Avg ★",      value: avgRating.toFixed(1), color: "text-amber-500" },
      ].map(({ label, value, color }) => (
        <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const QAFeedbackPage = () => {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterResolved, setFilterResolved] = useState<"all" | "open" | "resolved">("all");
  const queryClient = useQueryClient();

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ["qa_feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qa_feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as QAFeedbackRow[];
    },
  });

  const toggleResolved = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      await supabase.from("qa_feedback").update({ resolved }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qa_feedback"] }),
  });

  const filtered = rows
    .filter(r => filterType === "all" || r.feedback_type === filterType)
    .filter(r => {
      if (filterResolved === "open")     return !r.resolved;
      if (filterResolved === "resolved") return r.resolved;
      return true;
    });

  return (
    <RoleGuard allowedRoles={["super_admin", "admin", "staff"]}>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                QA Feedback
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Staff feedback from live testing sessions
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2 shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>

          {/* Summary */}
          {rows.length > 0 && <SummaryCards rows={rows} />}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="bug">🐛 Bug</SelectItem>
                <SelectItem value="confused">❓ Confused</SelectItem>
                <SelectItem value="suggestion">💡 Idea</SelectItem>
                <SelectItem value="praise">🎉 Love it</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterResolved} onValueChange={(v) => setFilterResolved(v as typeof filterResolved)}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground self-center ml-auto">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              Loading feedback…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-3xl mb-2">📭</p>
              <p className="font-medium">No feedback yet</p>
              <p className="text-sm mt-1">Share the link with your QA testers to get started.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-8" />
                    <TableHead>Type</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="hidden md:table-cell">Page</TableHead>
                    <TableHead className="hidden sm:table-cell">Tester</TableHead>
                    <TableHead className="hidden lg:table-cell">Rating</TableHead>
                    <TableHead className="hidden lg:table-cell">Time</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => {
                    const meta = TYPE_META[row.feedback_type] || TYPE_META.suggestion;
                    return (
                      <TableRow
                        key={row.id}
                        className={row.resolved ? "opacity-50" : ""}
                      >
                        {/* Resolved toggle */}
                        <TableCell className="pr-0">
                          <button
                            onClick={() => toggleResolved.mutate({ id: row.id, resolved: !row.resolved })}
                            className="text-muted-foreground hover:text-green-600 transition-colors"
                            title={row.resolved ? "Mark as open" : "Mark as resolved"}
                          >
                            {row.resolved
                              ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                              : <Circle className="h-4 w-4" />
                            }
                          </button>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
                            {meta.emoji} {meta.label}
                          </span>
                        </TableCell>

                        {/* Feedback text */}
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-foreground line-clamp-2">
                            {row.feedback_text}
                          </p>
                        </TableCell>

                        {/* Page */}
                        <TableCell className="hidden md:table-cell">
                          <a
                            href={row.page_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[180px]"
                            title={row.page_url || ""}
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            {row.page_url || "—"}
                          </a>
                        </TableCell>

                        {/* Tester */}
                        <TableCell className="hidden sm:table-cell">
                          <p className="text-xs text-foreground font-medium">
                            {row.tester_name || "Anonymous"}
                          </p>
                          {row.tester_email && (
                            <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                              {row.tester_email}
                            </p>
                          )}
                        </TableCell>

                        {/* Rating */}
                        <TableCell className="hidden lg:table-cell">
                          <StarDisplay rating={row.star_rating} />
                        </TableCell>

                        {/* Time */}
                        <TableCell className="hidden lg:table-cell">
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(row.created_at)}
                          </p>
                        </TableCell>

                        {/* Status badge */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={row.resolved
                              ? "text-green-600 border-green-300 bg-green-50 dark:bg-green-950/30 text-xs"
                              : "text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-xs"
                            }
                          >
                            {row.resolved ? "Resolved" : "Open"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default QAFeedbackPage;
