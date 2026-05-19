import { useState } from "react";
import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, TrendingUp, AlertCircle } from "lucide-react";
import { useClaims, useUpdateClaimStatus } from "@/modules/clinic";

const STATUS_VARIANT: Record<string, any> = { draft: "outline", submitted: "secondary", approved: "default", paid: "default", rejected: "destructive", cancelled: "outline" };

export default function Claims() {
  const [status, setStatus] = useState("all");
  const { data = [], isLoading } = useClaims(status);
  const update = useUpdateClaimStatus();

  const totalOutstanding = data.filter((c: any) => ["submitted", "approved"].includes(c.status)).reduce((s: number, c: any) => s + Number(c.amount_billed || 0), 0);
  const totalPaid = data.filter((c: any) => c.status === "paid").reduce((s: number, c: any) => s + Number(c.amount_paid || c.amount_billed || 0), 0);

  return (
    <RoleGuard allowedRoles={["branch_staff", "branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Insurance Claims</h1>
            <p className="text-muted-foreground">Track HMO authorisations and reimbursement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total claims</p><p className="text-2xl font-bold">{data.length}</p></div><Receipt className="h-8 w-8 text-primary opacity-30" /></CardContent></Card>
            <Card><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Outstanding</p><p className="text-2xl font-bold">₦{totalOutstanding.toLocaleString()}</p></div><AlertCircle className="h-8 w-8 text-amber-500 opacity-50" /></CardContent></Card>
            <Card><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Paid</p><p className="text-2xl font-bold">₦{totalPaid.toLocaleString()}</p></div><TrendingUp className="h-8 w-8 text-green-600 opacity-50" /></CardContent></Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Claims ({data.length})</CardTitle>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-40" /> : data.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No claims yet</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Claim #</TableHead><TableHead>Patient</TableHead><TableHead>HMO</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm">{c.claim_number}</TableCell>
                        <TableCell>{c.patient?.full_name || "—"}</TableCell>
                        <TableCell>{c.hmo?.name || "—"}</TableCell>
                        <TableCell>₦{Number(c.amount_billed).toLocaleString()}</TableCell>
                        <TableCell><Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge></TableCell>
                        <TableCell>
                          {c.status === "draft" && <Button size="sm" variant="outline" onClick={() => update.mutate({ id: c.id, status: "submitted" })}>Submit</Button>}
                          {c.status === "submitted" && <Button size="sm" variant="outline" onClick={() => update.mutate({ id: c.id, status: "approved" })}>Approve</Button>}
                          {c.status === "approved" && <Button size="sm" onClick={() => update.mutate({ id: c.id, status: "paid" })}>Mark paid</Button>}
                        </TableCell>
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
