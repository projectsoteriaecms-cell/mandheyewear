import { AdminLayout } from "@/shared/layouts/admin";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Clock, Users, Mail, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useLiveActivity,
  useErrorFeed,
  useSignupFunnel,
  useEmailHealth,
  useErrorCount24h,
  useActiveSessions24h,
} from "./useObservabilityData";

const Observability = () => {
  const { data: activity, isLoading: activityLoading } = useLiveActivity(30);
  const { data: errors, isLoading: errorsLoading } = useErrorFeed();
  const { data: funnel, isLoading: funnelLoading } = useSignupFunnel();
  const { data: emailHealth, isLoading: emailLoading } = useEmailHealth();
  const { data: errorCount24h, isLoading: errorCountLoading } = useErrorCount24h();
  const { data: activeSessions24h, isLoading: sessionsLoading } = useActiveSessions24h();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "fatal":
        return "destructive";
      case "error":
        return "destructive";
      case "warn":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <RoleGuard allowedRoles={["branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Platform Observability</h1>
            <p className="text-muted-foreground">
              Real-time visibility into user journeys, errors, and system health
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Active Sessions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Sessions (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{activeSessions24h}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Unique visitors</p>
              </CardContent>
            </Card>

            {/* Errors 24h */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Errors (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                {errorCountLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{errorCount24h}</div>
                    {errorCount24h > 5 && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Errors & fatals</p>
              </CardContent>
            </Card>

            {/* Email Health */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Email Delivery (7d)</CardTitle>
              </CardHeader>
              <CardContent>
                {emailLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{emailHealth?.counts.delivered || 0}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {emailHealth?.total ? `of ${emailHealth.total} sent` : "0 sent"}
                </p>
              </CardContent>
            </Card>

            {/* Signup Success Rate */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Signup → Login (7d)</CardTitle>
              </CardHeader>
              <CardContent>
                {funnelLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold">
                    {funnel && funnel[0]?.count > 0
                      ? Math.round((funnel[3]?.count / funnel[0].count) * 100)
                      : 0}
                    %
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">End-to-end conversion</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="funnel" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="funnel">Funnel</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            {/* Funnel Tab */}
            <TabsContent value="funnel">
              <Card>
                <CardHeader>
                  <CardTitle>Signup Funnel (7 days)</CardTitle>
                  <CardDescription>User journey from signup to login</CardDescription>
                </CardHeader>
                <CardContent>
                  {funnelLoading ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {funnel?.map((step, idx) => {
                        const pct = funnel[0].count > 0 ? (step.count / funnel[0].count) * 100 : 0;
                        return (
                          <div key={step.key} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{step.label}</span>
                              <span className="text-muted-foreground">
                                {step.count.toLocaleString()} ({Math.round(pct)}%)
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            {idx < funnel.length - 1 && (
                              <div className="text-xs text-muted-foreground">
                                Drop-off: {(funnel[idx].count - funnel[idx + 1].count).toLocaleString()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Live Activity Feed</CardTitle>
                  <CardDescription>Last 30 events across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="space-y-3">
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : activity && activity.length > 0 ? (
                    <ScrollArea className="h-96">
                      <div className="space-y-3 pr-4">
                        {activity.map((event) => (
                          <div key={event.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                            <div className="mt-1">
                              {event.severity === "error" || event.severity === "fatal" ? (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm">{event.event_type}</span>
                                <Badge variant={getSeverityColor(event.severity)} className="text-xs">
                                  {event.severity}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {event.page && <span>{event.page} • </span>}
                                {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No events in the last 24 hours</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Errors Tab */}
            <TabsContent value="errors">
              <Card>
                <CardHeader>
                  <CardTitle>Error Feed</CardTitle>
                  <CardDescription>Most recent errors grouped by type and affected sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {errorsLoading ? (
                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : errors && errors.length > 0 ? (
                    <ScrollArea className="h-96">
                      <div className="space-y-4 pr-4">
                        {errors.map((err, idx) => (
                          <div key={idx} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-mono text-sm font-medium break-all">{err.event_type}</div>
                              <Badge variant="destructive" className="text-xs shrink-0">
                                {err.occurrences}
                              </Badge>
                            </div>
                            {err.message && (
                              <div className="text-xs text-muted-foreground break-all">{err.message}</div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              <Users className="inline h-3 w-3 mr-1" />
                              {err.sessions_affected} session{err.sessions_affected !== 1 ? "s" : ""} affected •{" "}
                              {formatDistanceToNow(new Date(err.last_seen), { addSuffix: true })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No errors recorded</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Email Delivery Health (7 days)</CardTitle>
                  <CardDescription>Auth email hook audit trail</CardDescription>
                </CardHeader>
                <CardContent>
                  {emailLoading ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : emailHealth ? (
                    <div className="space-y-4">
                      {/* Status Breakdown */}
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(emailHealth.counts).map(([status, count]) => (
                          <div key={status} className="border rounded-lg p-3 text-center">
                            <div className="text-lg font-bold">{count}</div>
                            <div className="text-xs text-muted-foreground capitalize">{status}</div>
                          </div>
                        ))}
                      </div>

                      {/* Recent Sends */}
                      {emailHealth.recent && emailHealth.recent.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-3">Recent Sends</h4>
                          <ScrollArea className="h-48">
                            <div className="space-y-2 pr-4">
                              {emailHealth.recent.map((send, idx) => (
                                <div key={idx} className="text-xs border rounded p-2 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs">{send.template_name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {send.status}
                                    </Badge>
                                  </div>
                                  <div className="text-muted-foreground truncate">{send.recipient_email}</div>
                                  {send.error_message && (
                                    <div className="text-destructive text-xs">{send.error_message}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No email data available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default Observability;
