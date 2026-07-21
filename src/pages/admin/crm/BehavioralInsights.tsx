import { useMemo } from 'react';
import { AdminLayout } from '@/shared/layouts/admin';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { AlertTriangle, TrendingUp, Users, Zap } from 'lucide-react';
import {
  CrmAccessGate,
  useFeatureUsage,
  useProductAffinity,
  useFunnelAnalysis,
  useBehavioralSegments,
  useAtRiskUsers,
  useVtoConversionAnalysis,
} from '@/modules/crm';
import { CrmTabs } from './CrmTabs';
import { RoleGuard } from "@/modules/auth";

const fmtPct = (n: number) => `${Math.round(n * 100)}%`;
const fmtCurrency = (n: number) => `₦${(n / 1_000_000).toFixed(1)}M`;

export default function BehavioralInsights() {
  const features = useFeatureUsage();
  const products = useProductAffinity();
  const funnel = useFunnelAnalysis();
  const segments = useBehavioralSegments();
  const atRisk = useAtRiskUsers(30);
  const vtoAnalysis = useVtoConversionAnalysis();

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const atRiskCount = atRisk.data?.length ?? 0;
    const totalAtRiskValue = atRisk.data?.reduce((sum, u) => sum + u.lifetime_value, 0) ?? 0;
    const topSegment = segments.data?.[0];
    const vtoMetrics = vtoAnalysis.data ?? [];
    const conversionRate = vtoMetrics.find((m) => m.metric === 'conversion_rate')?.value ?? 0;

    return {
      atRiskCount,
      totalAtRiskValue,
      topSegment,
      conversionRate,
    };
  }, [atRisk.data, segments.data, vtoAnalysis.data]);

  const isLoading = features.isLoading || funnel.isLoading || segments.isLoading || atRisk.isLoading;

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin', 'branch_manager']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Behavioral Insights</h1>
            <p className="text-muted-foreground">
              Customer journey, funnel analysis, at-risk users, and conversion metrics.
            </p>
          </div>

          <CrmTabs />

          <CrmAccessGate>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">At-Risk Users (30 days)</div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-destructive">{summaryMetrics.atRiskCount}</p>
                )}
                {summaryMetrics.totalAtRiskValue > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Value: {fmtCurrency(summaryMetrics.totalAtRiskValue)}
                  </p>
                )}
              </Card>

              <Card className="p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">VTO Conversion Rate</div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-emerald-600">{fmtPct(summaryMetrics.conversionRate)}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">Visitor → Order</p>
              </Card>

              <Card className="p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">Top Segment</div>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="font-semibold text-sm">{summaryMetrics.topSegment?.segment_name || '—'}</p>
                )}
                {summaryMetrics.topSegment && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {summaryMetrics.topSegment.user_count} users
                  </p>
                )}
              </Card>

              <Card className="p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">Segments</div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{segments.data?.length ?? 0}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">Behavioral groups</p>
              </Card>
            </div>

            {/* Funnel Analysis */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Conversion Funnel</h2>
              {funnel.isLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : funnel.data?.length ? (
                <Card className="overflow-hidden">
                  <div className="space-y-2 p-4">
                    {funnel.data.map((stage, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{stage.stage}</span>
                          <span className="text-muted-foreground">{stage.unique_users.toLocaleString()} users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{
                              width: `${Math.max((stage.unique_users / (funnel.data?.[0]?.unique_users ?? 1)) * 100, 3)}%`,
                            }}
                          />
                          <span className="text-xs text-muted-foreground min-w-fit">
                            {fmtPct(stage.pct_of_previous)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 text-center text-muted-foreground">No funnel data</Card>
              )}
            </div>

            {/* Feature Usage */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Feature Usage (Last 30 Days)</h2>
              {features.isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : features.data?.length ? (
                <Card className="overflow-hidden">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Feature</TableCell>
                        <TableCell>Total Events</TableCell>
                        <TableCell>Unique Users</TableCell>
                        <TableCell>Last 30 Days</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {features.data.map((feature) => (
                        <TableRow key={feature.feature_name}>
                          <TableCell className="font-medium">{feature.feature_name}</TableCell>
                          <TableCell className="text-sm">{feature.event_count.toLocaleString()}</TableCell>
                          <TableCell className="text-sm">{feature.unique_users.toLocaleString()}</TableCell>
                          <TableCell className="text-sm">{feature.last_30_days_count.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="p-6 text-center text-muted-foreground">No feature usage data</Card>
              )}
            </div>

            {/* Product Affinity */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Product Affinity (Conversion Rates)</h2>
              {products.isLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : products.data?.length ? (
                <Card className="overflow-hidden">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product ID</TableCell>
                        <TableCell>Views</TableCell>
                        <TableCell>Add to Cart</TableCell>
                        <TableCell>Purchases</TableCell>
                        <TableCell>View → Cart</TableCell>
                        <TableCell>Cart → Purchase</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.data
                        .sort((a, b) => b.purchase_count - a.purchase_count)
                        .slice(0, 10)
                        .map((product) => (
                          <TableRow key={product.product_id}>
                            <TableCell className="font-mono text-sm">{product.product_id.slice(0, 8)}</TableCell>
                            <TableCell className="text-sm">{product.product_views}</TableCell>
                            <TableCell className="text-sm">{product.add_to_cart_count}</TableCell>
                            <TableCell className="text-sm font-medium">{product.purchase_count}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{fmtPct(product.view_to_cart_rate)}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{fmtPct(product.cart_to_purchase_rate)}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="p-6 text-center text-muted-foreground">No product affinity data</Card>
              )}
            </div>

            {/* Behavioral Segments */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Behavioral Segments</h2>
              {segments.isLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : segments.data?.length ? (
                <Card className="overflow-hidden">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Segment</TableCell>
                        <TableCell>User Count</TableCell>
                        <TableCell>Avg LTV</TableCell>
                        <TableCell>Engagement Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {segments.data.map((segment) => (
                        <TableRow key={segment.segment_name}>
                          <TableCell className="font-medium">{segment.segment_name}</TableCell>
                          <TableCell className="text-sm">{segment.user_count.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">{fmtCurrency(segment.avg_ltv)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={segment.engagement_score > 0.7 ? 'default' : 'secondary'}
                            >
                              {(segment.engagement_score * 100).toFixed(0)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="p-6 text-center text-muted-foreground">No segment data</Card>
              )}
            </div>

            {/* At-Risk Users */}
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                At-Risk Users (Inactive 30+ Days)
              </h2>
              {atRisk.isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : atRisk.data?.length ? (
                <Card className="overflow-hidden">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Contact</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Last Engagement</TableCell>
                        <TableCell>Days Inactive</TableCell>
                        <TableCell>Lifetime Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {atRisk.data
                        .sort((a, b) => b.lifetime_value - a.lifetime_value)
                        .slice(0, 15)
                        .map((user) => (
                          <TableRow key={user.email} className="bg-destructive/5">
                            <TableCell className="font-medium">{user.full_name || '—'}</TableCell>
                            <TableCell className="font-mono text-sm">{user.email}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(user.last_engagement_date).toLocaleDateString('en-NG', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive">{user.days_since_engagement} days</Badge>
                            </TableCell>
                            <TableCell className="font-semibold">{fmtCurrency(user.lifetime_value)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="p-6 text-center text-muted-foreground">No at-risk users</Card>
              )}
            </div>

            {/* VTO Conversion Metrics */}
            <div>
              <h2 className="text-lg font-semibold mb-3">VTO Conversion Metrics</h2>
              {vtoAnalysis.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
              ) : vtoAnalysis.data?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {vtoAnalysis.data.map((metric) => (
                    <Card key={metric.metric} className="p-4">
                      <p className="text-sm text-muted-foreground mb-2 capitalize">
                        {metric.metric.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold">{metric.value.toFixed(2)}</p>
                        {metric.metric.includes('rate') && <span className="text-muted-foreground">%</span>}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center text-muted-foreground">No VTO analysis data</Card>
              )}
            </div>
          </CrmAccessGate>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}
