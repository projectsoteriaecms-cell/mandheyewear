import { useState } from "react";
import { Play, Clock, Users, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type {
  ReengagementTrigger,
  FireTriggerResult,
} from "../hooks/useReengagementTriggers";
import {
  useFireTrigger,
  useToggleTrigger,
  triggerTypeLabel,
} from "../hooks/useReengagementTriggers";

interface Props {
  trigger: ReengagementTrigger;
}

export function TriggerCard({ trigger }: Props) {
  const navigate = useNavigate();
  const { fire, isPending } = useFireTrigger();
  const toggle = useToggleTrigger();
  const [lastResult, setLastResult] = useState<FireTriggerResult | null>(null);
  const [fireError, setFireError] = useState<string | null>(null);

  async function handleFire() {
    setLastResult(null);
    setFireError(null);
    try {
      const result = await fire(trigger.id);
      setLastResult(result);
    } catch (err) {
      setFireError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function handleToggle() {
    await toggle.mutateAsync({ id: trigger.id, isActive: !trigger.is_active });
  }

  const lastRun = trigger.last_run_at
    ? new Date(trigger.last_run_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={[
        "rounded-lg border bg-card p-4 shadow-sm transition-opacity",
        !trigger.is_active && "opacity-60",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {trigger.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {triggerTypeLabel(trigger.trigger_type as any)} ·{" "}
            {trigger.threshold_days} days
          </p>
        </div>

        {/* Active toggle */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggle.isPending}
          title={trigger.is_active ? "Disable trigger" : "Enable trigger"}
          className="flex-none text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {trigger.is_active ? (
            <ToggleRight className="h-5 w-5 text-green-500" />
          ) : (
            <ToggleLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Description */}
      {trigger.description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
          {trigger.description}
        </p>
      )}

      {/* Stats row */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        {lastRun && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last run {lastRun}
          </span>
        )}
        {trigger.last_contact_count > 0 && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {trigger.last_contact_count.toLocaleString()} contacts
          </span>
        )}
        {trigger.last_campaign_status && (
          <span className="ml-auto capitalize">
            {trigger.last_campaign_status}
          </span>
        )}
      </div>

      {/* Fire result banner */}
      {lastResult && (
        <div
          className={[
            "mt-3 flex items-start gap-2 rounded-md px-3 py-2 text-xs",
            lastResult.contact_count === 0
              ? "border border-muted bg-muted/40 text-muted-foreground"
              : "border border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400",
          ].join(" ")}
        >
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none" />
          {lastResult.contact_count === 0 ? (
            <span>No matching contacts — nothing to send.</span>
          ) : (
            <span className="flex flex-col gap-1">
              <span>
                Campaign created for{" "}
                <strong>{lastResult.contact_count.toLocaleString()}</strong>{" "}
                contacts and set to <em>scheduled</em>.
              </span>
              {lastResult.campaign_id && (
                <button
                  type="button"
                  onClick={() => navigate("/admin/crm/campaigns")}
                  className="flex items-center gap-1 underline underline-offset-2 hover:opacity-80"
                >
                  <ExternalLink className="h-3 w-3" /> View in Active tab
                </button>
              )}
            </span>
          )}
        </div>
      )}

      {/* Link to last fired campaign */}
      {!lastResult && trigger.last_campaign_id && trigger.last_campaign_name && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <span>Last campaign:</span>
          <button
            type="button"
            onClick={() => navigate("/admin/crm/campaigns")}
            className="flex items-center gap-0.5 text-primary underline underline-offset-2 hover:opacity-80"
          >
            {trigger.last_campaign_name}
            <ExternalLink className="h-3 w-3" />
          </button>
          {trigger.last_campaign_status && (
            <span className="ml-1 capitalize">· {trigger.last_campaign_status}</span>
          )}
        </div>
      )}

      {fireError && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none" />
          <span>{fireError}</span>
        </div>
      )}

      {/* Footer: Fire now */}
      <div className="mt-4 border-t border-border/60 pt-3">
        <button
          type="button"
          onClick={handleFire}
          disabled={isPending || !trigger.is_active}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-3 w-3" />
          {isPending ? "Firing…" : "Fire now"}
        </button>
      </div>
    </div>
  );
}
