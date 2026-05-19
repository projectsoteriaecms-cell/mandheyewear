import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import { useEncounter, useSaveEncounter, useDoctors, usePatients } from "@/modules/clinic";

export default function EncounterEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: existing } = useEncounter(isNew ? undefined : id);
  const { data: doctors = [] } = useDoctors();
  const { data: patients = [] } = usePatients();
  const save = useSaveEncounter();

  const [form, setForm] = useState<any>({
    user_id: searchParams.get("patient") || "",
    doctor_id: "",
    chief_complaint: "",
    history: "",
    vitals: { va_right: "", va_left: "", iop_right: "", iop_left: "" },
    refraction: { sph_r: "", cyl_r: "", axis_r: "", sph_l: "", cyl_l: "", axis_l: "", add: "", pd: "" },
    anterior_segment: "",
    posterior_segment: "",
    diagnoses: [],
    plan: "",
    status: "draft",
  });

  useEffect(() => {
    if (existing) {
      setForm({
        ...existing,
        vitals: existing.vitals || {},
        refraction: existing.refraction || {},
        diagnoses: existing.diagnoses || [],
      });
    }
  }, [existing]);

  const setField = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const setNested = (key: string, sub: string, v: any) => setForm((f: any) => ({ ...f, [key]: { ...f[key], [sub]: v } }));

  const handleSave = async (sign = false) => {
    const payload: any = { ...form };
    if (isNew) delete payload.id;
    if (sign) {
      payload.status = "signed";
      payload.signed_at = new Date().toISOString();
      const { data: u } = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getUser());
      payload.signed_by = u.user?.id;
    }
    if (!payload.user_id) return alert("Select a patient");
    const result = await save.mutateAsync(payload);
    navigate(`/admin/clinic/encounters/${result.id}`);
  };

  return (
    <RoleGuard allowedRoles={["branch_staff", "branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6 max-w-5xl">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild><Link to="/admin/clinic/encounters"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
            <div className="flex gap-2 items-center">
              <Badge variant={form.status === "signed" ? "default" : "outline"}>{form.status}</Badge>
              <Button variant="outline" onClick={() => handleSave(false)} disabled={save.isPending}><Save className="h-4 w-4 mr-2" />Save Draft</Button>
              {form.status !== "signed" && <Button onClick={() => handleSave(true)} disabled={save.isPending}><CheckCircle className="h-4 w-4 mr-2" />Sign & Lock</Button>}
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>Visit Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Patient</Label>
                <Select value={form.user_id} onValueChange={v => setField("user_id", v)} disabled={!isNew}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p: any) => <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Doctor</Label>
                <Select value={form.doctor_id || ""} onValueChange={v => setField("doctor_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Assign doctor" /></SelectTrigger>
                  <SelectContent>
                    {doctors.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Chief complaint</Label>
                <Input value={form.chief_complaint || ""} onChange={e => setField("chief_complaint", e.target.value)} placeholder="e.g. Blurred vision for 2 weeks" />
              </div>
              <div className="md:col-span-2">
                <Label>History of presenting illness</Label>
                <Textarea value={form.history || ""} onChange={e => setField("history", e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Vitals</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>VA (R)</Label><Input value={form.vitals?.va_right || ""} onChange={e => setNested("vitals", "va_right", e.target.value)} placeholder="6/6" /></div>
              <div><Label>VA (L)</Label><Input value={form.vitals?.va_left || ""} onChange={e => setNested("vitals", "va_left", e.target.value)} placeholder="6/6" /></div>
              <div><Label>IOP (R)</Label><Input value={form.vitals?.iop_right || ""} onChange={e => setNested("vitals", "iop_right", e.target.value)} placeholder="mmHg" /></div>
              <div><Label>IOP (L)</Label><Input value={form.vitals?.iop_left || ""} onChange={e => setNested("vitals", "iop_left", e.target.value)} placeholder="mmHg" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Refraction</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground mb-2">
                <span>Eye</span><span>SPH</span><span>CYL</span><span>AXIS</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                <span className="self-center font-medium">Right</span>
                <Input value={form.refraction?.sph_r || ""} onChange={e => setNested("refraction", "sph_r", e.target.value)} />
                <Input value={form.refraction?.cyl_r || ""} onChange={e => setNested("refraction", "cyl_r", e.target.value)} />
                <Input value={form.refraction?.axis_r || ""} onChange={e => setNested("refraction", "axis_r", e.target.value)} />
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <span className="self-center font-medium">Left</span>
                <Input value={form.refraction?.sph_l || ""} onChange={e => setNested("refraction", "sph_l", e.target.value)} />
                <Input value={form.refraction?.cyl_l || ""} onChange={e => setNested("refraction", "cyl_l", e.target.value)} />
                <Input value={form.refraction?.axis_l || ""} onChange={e => setNested("refraction", "axis_l", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>ADD</Label><Input value={form.refraction?.add || ""} onChange={e => setNested("refraction", "add", e.target.value)} /></div>
                <div><Label>PD (mm)</Label><Input value={form.refraction?.pd || ""} onChange={e => setNested("refraction", "pd", e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Examination</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Anterior segment</Label><Textarea value={form.anterior_segment || ""} onChange={e => setField("anterior_segment", e.target.value)} rows={3} /></div>
              <div><Label>Posterior segment</Label><Textarea value={form.posterior_segment || ""} onChange={e => setField("posterior_segment", e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Assessment & Plan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Diagnoses (comma-separated)</Label>
                <Input value={(form.diagnoses || []).join(", ")} onChange={e => setField("diagnoses", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="e.g. Myopia, Dry eye syndrome" />
              </div>
              <div><Label>Plan / management</Label><Textarea value={form.plan || ""} onChange={e => setField("plan", e.target.value)} rows={4} /></div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}
