import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/shared/layouts/admin";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, RefreshCw, Loader2, Database } from "lucide-react";

const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
const PROJECT_URL = import.meta.env.VITE_SUPABASE_URL as string;

const detectEnvironment = (): "production" | "preview" | "local" => {
  if (typeof window === "undefined") return "production";
  const host = window.location.hostname;
  if (host === "localhost" || host.startsWith("127.")) return "local";
  if (host.includes("vercel.app")) return "preview";
  return "production";
};

const SystemStatus = () => {
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    setChecking(true);
    setErrorMsg(null);
    const t0 = performance.now();
    try {
      const { error } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .limit(1);
      const ms = Math.round(performance.now() - t0);
      setLatencyMs(ms);
      if (error) {
        setHealthy(false);
        setErrorMsg(error.message);
      } else {
        setHealthy(true);
      }
    } catch (err) {
      setHealthy(false);
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLastCheck(new Date());
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const env = detectEnvironment();

  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">System Status</h1>
              <p className="text-muted-foreground">
                Connected backend and live health check
              </p>
            </div>
            <Button onClick={runCheck} disabled={checking} variant="outline">
              {checking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Re-check
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backend Connection
              </CardTitle>
              <CardDescription>
                Supabase Postgres, Auth, Storage &amp; Edge Functions — managed on your own Supabase account.
                Find it at <strong>supabase.com/dashboard/project/znhrwzxthusqtqreawwq</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Row label="Status">
                {healthy === null ? (
                  <Badge variant="secondary">Checking…</Badge>
                ) : healthy ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active &amp; healthy
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Unreachable
                  </Badge>
                )}
              </Row>
              <Row label="Project ref">
                <code className="text-sm font-mono">{PROJECT_REF || "—"}</code>
              </Row>
              <Row label="Project URL">
                <code className="text-sm font-mono break-all">{PROJECT_URL || "—"}</code>
              </Row>
              <Row label="Environment">
                <Badge variant="outline" className="capitalize">{env}</Badge>
              </Row>
              <Row label="Frontend host">
                <code className="text-sm font-mono">{typeof window !== "undefined" ? window.location.hostname : "—"}</code>
              </Row>
              <Row label="Latency">
                <span className="text-sm">{latencyMs !== null ? `${latencyMs} ms` : "—"}</span>
              </Row>
              <Row label="Last check">
                <span className="text-sm">
                  {lastCheck ? lastCheck.toLocaleString() : "—"}
                </span>
              </Row>
              {errorMsg && (
                <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">
                  {errorMsg}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 border-b last:border-b-0 pb-3 last:pb-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="text-right">{children}</div>
  </div>
);

export default SystemStatus;
