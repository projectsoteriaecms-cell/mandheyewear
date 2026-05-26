import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, FileText } from "lucide-react";
import { type PrescriptionInsert, type EyeData } from "../hooks/usePrescriptions";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onSave: (rx: PrescriptionInsert) => void;
  isSaving?: boolean;
}

const EMPTY_EYE: EyeData = {
  sph: null, cyl: null, axis: null, add: null,
  prism_h: null, prism_v: null,
};

function EyeGrid({
  label, value, onChange,
}: {
  label: string;
  value: EyeData;
  onChange: (v: EyeData) => void;
}) {
  const field = (name: keyof EyeData, placeholder: string) => (
    <div>
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{name.replace("_", " ")}</Label>
      <Input
        type="number"
        step="0.25"
        placeholder={placeholder}
        value={value[name] ?? ""}
        onChange={(e) =>
          onChange({ ...value, [name]: e.target.value === "" ? null : parseFloat(e.target.value) })
        }
        className="h-9 text-sm"
      />
    </div>
  );
  return (
    <div className="space-y-2">
      <p className="font-semibold text-sm">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {field("sph", "e.g. −2.25")}
        {field("cyl", "e.g. −0.50")}
        {field("axis", "e.g. 180")}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {field("add", "e.g. +1.75")}
        {field("prism_h", "Prism H")}
        {field("prism_v", "Prism V")}
      </div>
    </div>
  );
}

export function PrescriptionForm({ onSave, isSaving }: Props) {
  const [tab, setTab] = useState<"manual" | "upload">("manual");

  // Manual entry
  const [rightEye, setRightEye] = useState<EyeData>({ ...EMPTY_EYE });
  const [leftEye, setLeftEye] = useState<EyeData>({ ...EMPTY_EYE });
  const [pdDistance, setPdDistance] = useState("");
  const [pdRight, setPdRight] = useState("");
  const [pdLeft, setPdLeft] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [prescriberName, setPrescriberName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [notes, setNotes] = useState("");

  // Upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleUpload = async (f: File) => {
    setFile(f);
    setUploading(true);
    try {
      const path = `prescriptions/${Date.now()}-${f.name}`;
      const { error } = await supabase.storage.from("product-images").upload(path, f, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setUploadedUrl(data.publicUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = () => {
    const expiryDate = issuedDate
      ? new Date(new Date(issuedDate).setFullYear(new Date(issuedDate).getFullYear() + 2))
          .toISOString()
          .split("T")[0]
      : null;
    onSave({
      issued_date: issuedDate || null,
      expiry_date: expiryDate,
      prescriber_name: prescriberName || null,
      clinic_name: clinicName || null,
      right_eye: rightEye,
      left_eye: leftEye,
      pd_distance: pdDistance ? parseFloat(pdDistance) : null,
      pd_near: null,
      pd_right: pdRight ? parseFloat(pdRight) : null,
      pd_left: pdLeft ? parseFloat(pdLeft) : null,
      source: "manual",
      document_url: null,
      is_active: true,
      notes: notes || null,
    });
  };

  const handleUploadSubmit = () => {
    if (!uploadedUrl) return;
    onSave({
      issued_date: issuedDate || null,
      expiry_date: issuedDate
        ? new Date(new Date(issuedDate).setFullYear(new Date(issuedDate).getFullYear() + 2))
            .toISOString()
            .split("T")[0]
        : null,
      prescriber_name: prescriberName || null,
      clinic_name: clinicName || null,
      right_eye: null,
      left_eye: null,
      pd_distance: null,
      pd_near: null,
      pd_right: null,
      pd_left: null,
      source: "uploaded",
      document_url: uploadedUrl,
      is_active: true,
      notes: notes || null,
    });
  };

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "manual" | "upload")} className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="manual"><FileText className="h-3.5 w-3.5 mr-1.5" />Enter Manually</TabsTrigger>
        <TabsTrigger value="upload"><Upload className="h-3.5 w-3.5 mr-1.5" />Upload Photo</TabsTrigger>
      </TabsList>

      {/* ── Manual entry ── */}
      <TabsContent value="manual" className="space-y-4 pt-2">
        <EyeGrid label="Right Eye (OD)" value={rightEye} onChange={setRightEye} />
        <EyeGrid label="Left Eye (OS)" value={leftEye} onChange={setLeftEye} />

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">PD (combined)</Label>
            <Input
              type="number" step="0.5" placeholder="e.g. 63"
              value={pdDistance} onChange={(e) => setPdDistance(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">PD Right</Label>
            <Input
              type="number" step="0.5" placeholder="e.g. 31.5"
              value={pdRight} onChange={(e) => setPdRight(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">PD Left</Label>
            <Input
              type="number" step="0.5" placeholder="e.g. 31.5"
              value={pdLeft} onChange={(e) => setPdLeft(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Date Issued</Label>
            <Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Prescriber Name</Label>
            <Input placeholder="Dr. Smith" value={prescriberName} onChange={(e) => setPrescriberName(e.target.value)} className="h-9 text-sm" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Clinic / Hospital</Label>
          <Input placeholder="Soteria Eye Clinic" value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Notes (optional)</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="text-sm" />
        </div>

        <Button onClick={handleManualSubmit} disabled={isSaving} className="w-full">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Prescription
        </Button>
      </TabsContent>

      {/* ── Upload ── */}
      <TabsContent value="upload" className="space-y-4 pt-2">
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/60 transition-colors"
          onClick={() => document.getElementById("rx-file-input")?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">
            {file ? file.name : "Click to upload prescription photo"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF</p>
          {uploading && <p className="text-xs text-primary mt-2">Uploading…</p>}
          {uploadedUrl && !uploading && (
            <p className="text-xs text-green-600 mt-2">✓ Uploaded successfully</p>
          )}
          <input
            id="rx-file-input"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Our dispensing team will review the uploaded prescription and contact you if any information is unclear.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Date Issued</Label>
            <Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Prescriber Name</Label>
            <Input placeholder="Dr. Smith" value={prescriberName} onChange={(e) => setPrescriberName(e.target.value)} className="h-9 text-sm" />
          </div>
        </div>
        <Button onClick={handleUploadSubmit} disabled={isSaving || !uploadedUrl || uploading} className="w-full">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save & Continue
        </Button>
      </TabsContent>
    </Tabs>
  );
}
