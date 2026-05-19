import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText } from "lucide-react";
import { useEncounters } from "@/modules/clinic";

export default function Encounters() {
  const [status, setStatus] = useState("all");
  const { data = [], isLoading } = useEncounters(status);

  return (
    <RoleGuard allowedRoles={["branch_staff", "branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Clinical Encounters</h1>
              <p className="text-muted-foreground">Visit records, exam notes & prescriptions</p>
            </div>
            <Button asChild><Link to="/admin/clinic/encounters/new"><Plus className="h-4 w-4 mr-2" />New Encounter</Link></Button>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Encounters ({data.length})</CardTitle>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="amended">Amended</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : data.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No encounters yet</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Complaint</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((e: any) => (
                      <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50" onClick={() => window.location.assign(`/admin/clinic/encounters/${e.id}`)}>
                        <TableCell className="font-medium">{e.patient?.full_name || "—"}</TableCell>
                        <TableCell>{e.doctor?.full_name || "—"}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{e.chief_complaint || "—"}</TableCell>
                        <TableCell>{new Date(e.created_at).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant={e.status === "signed" ? "default" : "outline"}>{e.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}
