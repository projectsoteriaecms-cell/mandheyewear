import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, User as UserIcon } from "lucide-react";
import { usePatients } from "@/modules/clinic";

export default function Patients() {
  const [q, setQ] = useState("");
  const { data: patients = [], isLoading } = usePatients(q);

  return (
    <RoleGuard allowedRoles={["branch_staff", "branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Patients</h1>
            <p className="text-muted-foreground">Search and view patient records</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by name, email or phone…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Patient Directory ({patients.length})</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : patients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No patients found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((p: any) => (
                      <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Link to={`/admin/clinic/patients/${p.user_id}`} className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{p.full_name || "Unnamed"}</span>
                          </Link>
                        </TableCell>
                        <TableCell>{p.email || "—"}</TableCell>
                        <TableCell>{p.phone_number || "—"}</TableCell>
                        <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
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
