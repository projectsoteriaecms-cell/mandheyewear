import { useState } from "react";
import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2 } from "lucide-react";
import { useHmoProviders, useSaveHmoProvider } from "@/modules/clinic";

export default function HMOProviders() {
  const { data = [] } = useHmoProviders();
  const save = useSaveHmoProvider();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: "", short_code: "", contact_email: "", contact_phone: "", billing_address: "", notes: "", is_active: true });

  const handleSave = async () => {
    if (!form.name) return;
    await save.mutateAsync(form);
    setOpen(false);
    setForm({ name: "", short_code: "", contact_email: "", contact_phone: "", billing_address: "", notes: "", is_active: true });
  };

  return (
    <RoleGuard allowedRoles={["branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">HMO Providers</h1>
              <p className="text-muted-foreground">Insurance partners and tariff sheets</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Provider</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New HMO Provider</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Short code</Label><Input value={form.short_code} onChange={e => setForm({ ...form, short_code: e.target.value })} /></div>
                  <div><Label>Contact email</Label><Input value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} /></div>
                  <div><Label>Contact phone</Label><Input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} /></div>
                  <div><Label>Billing address</Label><Textarea value={form.billing_address} onChange={e => setForm({ ...form, billing_address: e.target.value })} rows={2} /></div>
                  <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
                  <Button onClick={handleSave} disabled={save.isPending} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Providers ({data.length})</CardTitle></CardHeader>
            <CardContent>
              {data.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No HMO providers yet — add your first one.</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.map((h: any) => (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium">{h.name}</TableCell>
                        <TableCell>{h.short_code || "—"}</TableCell>
                        <TableCell>{h.contact_email || "—"}</TableCell>
                        <TableCell>{h.contact_phone || "—"}</TableCell>
                        <TableCell><Badge variant={h.is_active ? "default" : "outline"}>{h.is_active ? "Active" : "Inactive"}</Badge></TableCell>
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
