import { useParams, Link } from "react-router-dom";
import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Calendar, Receipt, Eye, Plus } from "lucide-react";
import { usePatient, usePatientHistory } from "@/modules/clinic";

export default function PatientDetail() {
  const { userId } = useParams<{ userId: string }>();
  const { data: patient, isLoading } = usePatient(userId);
  const { data: history } = usePatientHistory(userId);

  if (isLoading) return <AdminLayout><Skeleton className="h-64" /></AdminLayout>;
  if (!patient) return <AdminLayout><p>Patient not found</p></AdminLayout>;

  return (
    <RoleGuard allowedRoles={["branch_staff", "branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild><Link to="/admin/clinic/patients"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
            <Button asChild><Link to={`/admin/clinic/encounters/new?patient=${userId}`}><Plus className="h-4 w-4 mr-2" />New Encounter</Link></Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{patient.full_name || "Unnamed"}</CardTitle>
                  <p className="text-muted-foreground">{patient.email}</p>
                  {patient.phone_number && <p className="text-sm text-muted-foreground">{patient.phone_number}</p>}
                </div>
                {(patient as any).hmo_member_number && (
                  <Badge variant="outline">HMO: {(patient as any).hmo_member_number}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Date of Birth:</span><p className="font-medium">{(patient as any).date_of_birth || "—"}</p></div>
                <div><span className="text-muted-foreground">Gender:</span><p className="font-medium">{(patient as any).gender || "—"}</p></div>
                <div><span className="text-muted-foreground">Allergies:</span><p className="font-medium">{(patient as any).allergies || "None recorded"}</p></div>
                <div><span className="text-muted-foreground">Rx on file:</span><p className="font-medium">{(patient as any).prescription_on_file ? "Yes" : "No"}</p></div>
              </div>
              {(patient as any).ocular_history && (
                <div className="mt-4">
                  <span className="text-muted-foreground text-sm">Ocular history:</span>
                  <p className="text-sm mt-1">{(patient as any).ocular_history}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="encounters">
            <TabsList>
              <TabsTrigger value="encounters"><FileText className="h-4 w-4 mr-1" />Encounters ({history?.encounters.length ?? 0})</TabsTrigger>
              <TabsTrigger value="appointments"><Calendar className="h-4 w-4 mr-1" />Appointments ({history?.appointments.length ?? 0})</TabsTrigger>
              <TabsTrigger value="prescriptions"><Eye className="h-4 w-4 mr-1" />Prescriptions ({history?.prescriptions.length ?? 0})</TabsTrigger>
              <TabsTrigger value="claims"><Receipt className="h-4 w-4 mr-1" />Claims ({history?.claims.length ?? 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="encounters" className="space-y-2">
              {history?.encounters.map((e: any) => (
                <Link key={e.id} to={`/admin/clinic/encounters/${e.id}`}>
                  <Card className="hover:bg-muted/50">
                    <CardContent className="pt-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{e.chief_complaint || "Visit"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</p>
                      </div>
                      <Badge variant={e.status === "signed" ? "default" : "outline"}>{e.status}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {!history?.encounters.length && <p className="text-muted-foreground text-sm">No encounters yet.</p>}
            </TabsContent>

            <TabsContent value="appointments" className="space-y-2">
              {history?.appointments.map((a: any) => (
                <Card key={a.id}>
                  <CardContent className="pt-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{a.service_type}</p>
                      <p className="text-xs text-muted-foreground">{a.scheduled_date} {a.scheduled_time} · {a.branch?.name}</p>
                    </div>
                    <Badge variant="outline">{a.status}</Badge>
                  </CardContent>
                </Card>
              ))}
              {!history?.appointments.length && <p className="text-muted-foreground text-sm">No appointments yet.</p>}
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-2">
              {history?.prescriptions.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="pt-4">
                    <p className="font-medium">Issued {p.issue_date}</p>
                    <p className="text-xs text-muted-foreground">Expires {p.expiry_date} · Dr. {p.doctor_name || "—"}</p>
                  </CardContent>
                </Card>
              ))}
              {!history?.prescriptions.length && <p className="text-muted-foreground text-sm">No prescriptions yet.</p>}
            </TabsContent>

            <TabsContent value="claims" className="space-y-2">
              {history?.claims.map((c: any) => (
                <Card key={c.id}>
                  <CardContent className="pt-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{c.claim_number} · {c.hmo?.name}</p>
                      <p className="text-xs text-muted-foreground">₦{Number(c.amount_billed).toLocaleString()}</p>
                    </div>
                    <Badge>{c.status}</Badge>
                  </CardContent>
                </Card>
              ))}
              {!history?.claims.length && <p className="text-muted-foreground text-sm">No claims yet.</p>}
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}
