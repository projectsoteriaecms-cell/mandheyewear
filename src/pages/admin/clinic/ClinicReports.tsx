import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClinicKpis } from "@/modules/clinic";
import { Activity, Users, FileText, Receipt, Bell, CalendarX, CalendarCheck, TrendingDown } from "lucide-react";

export default function ClinicReports() {
  const { data, isLoading } = useClinicKpis();

  const cards = [
    { label: "Visits today", value: data?.visits_today, icon: CalendarCheck },
    { label: "Completed today", value: data?.completed_today, icon: Activity },
    { label: "No-shows today", value: data?.no_shows_today, icon: CalendarX },
    { label: "Upcoming (7 days)", value: data?.upcoming_7d, icon: CalendarCheck },
    { label: "Open encounters", value: data?.open_encounters, icon: FileText },
    { label: "Pending claims", value: data?.pending_claims, icon: Receipt },
    { label: "Claims outstanding", value: data ? `₦${Number(data.claims_outstanding_amount).toLocaleString()}` : "—", icon: Receipt },
    { label: "Recalls due (7 days)", value: data?.recalls_due, icon: Bell },
    { label: "Active patients (30 days)", value: data?.active_patients_30d, icon: Users },
    { label: "Lapsed patients (>1yr)", value: data?.lapsed_patients, icon: TrendingDown },
  ];

  return (
    <RoleGuard allowedRoles={["branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Clinic Reports</h1>
            <p className="text-muted-foreground">Operational health of the clinical practice</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((c) => (
              <Card key={c.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <c.icon className="h-4 w-4" />{c.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>{isLoading ? <Skeleton className="h-7 w-20" /> : <p className="text-2xl font-bold">{c.value ?? "—"}</p>}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}
