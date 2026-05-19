import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodaysAppointments, useUpdateAppointmentStage } from "@/modules/clinic";
import { Clock, User, ArrowRight, X } from "lucide-react";

const COLUMNS = [
  { key: "scheduled", label: "Scheduled", filter: (a: any) => !a.checked_in_at && !a.no_show && a.status !== "cancelled" },
  { key: "checked_in", label: "Checked In", filter: (a: any) => a.checked_in_at && !a.in_room_at },
  { key: "in_room", label: "In Room", filter: (a: any) => a.in_room_at && !a.completed_at },
  { key: "completed", label: "Completed", filter: (a: any) => a.completed_at || a.no_show },
];

export default function AppointmentBoard() {
  const { data = [], isLoading } = useTodaysAppointments();
  const update = useUpdateAppointmentStage();

  return (
    <RoleGuard allowedRoles={["branch_staff", "branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Today's Board</h1>
            <p className="text-muted-foreground">Check patients in, move through rooms, and close visits</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {COLUMNS.map(col => {
                const items = data.filter(col.filter);
                return (
                  <Card key={col.key} className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        {col.label}
                        <Badge variant="secondary">{items.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Empty</p>}
                      {items.map((a: any) => (
                        <Card key={a.id} className="bg-background">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate flex items-center gap-1"><User className="h-3 w-3" />{a.patient?.full_name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground truncate">{a.service_type}</p>
                              </div>
                              <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0"><Clock className="h-3 w-3" />{a.scheduled_time?.slice(0, 5)}</span>
                            </div>
                            <div className="flex gap-1">
                              {col.key === "scheduled" && (
                                <>
                                  <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => update.mutate({ id: a.id, stage: "checked_in" })}>Check in <ArrowRight className="h-3 w-3 ml-1" /></Button>
                                  <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => update.mutate({ id: a.id, stage: "no_show" })}><X className="h-3 w-3" /></Button>
                                </>
                              )}
                              {col.key === "checked_in" && <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => update.mutate({ id: a.id, stage: "in_room" })}>To room <ArrowRight className="h-3 w-3 ml-1" /></Button>}
                              {col.key === "in_room" && <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => update.mutate({ id: a.id, stage: "completed" })}>Complete <ArrowRight className="h-3 w-3 ml-1" /></Button>}
                              {col.key === "completed" && <Badge variant={a.no_show ? "destructive" : "default"} className="text-xs">{a.no_show ? "No-show" : "Done"}</Badge>}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}
