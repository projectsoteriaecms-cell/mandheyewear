import { useState } from "react";
import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Send } from "lucide-react";
import { useRecalls, useMarkRecallSent } from "@/modules/clinic";

export default function Recalls() {
  const [status, setStatus] = useState("pending");
  const { data = [], isLoading } = useRecalls(status);
  const mark = useMarkRecallSent();

  return (
    <RoleGuard allowedRoles={["branch_staff", "branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Recalls & Campaigns</h1>
            <p className="text-muted-foreground">Bring patients back at the right time — annual exams, contact lens follow-ups, post-op</p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Recalls ({data.length})</CardTitle>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-40" /> : data.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No recalls in this view yet.<br /><span className="text-xs">As encounters are signed, recalls auto-populate via the rules engine (Phase 2).</span></div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Type</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <p className="font-medium">{r.patient?.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{r.patient?.email}</p>
                        </TableCell>
                        <TableCell><Badge variant="outline">{r.recall_type.replace("_", " ")}</Badge></TableCell>
                        <TableCell>{new Date(r.due_date).toLocaleDateString()}</TableCell>
                        <TableCell><Badge>{r.status}</Badge></TableCell>
                        <TableCell>{r.status === "pending" && <Button size="sm" variant="outline" onClick={() => mark.mutate(r.id)}><Send className="h-3 w-3 mr-1" />Mark sent</Button>}</TableCell>
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
