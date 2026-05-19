import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface CrmSettings {
  id: string;
  brevo_list_booked: number | null;
  brevo_list_patients: number | null;
  brevo_list_recovery: number | null;
  brevo_attributes_ready: boolean | null;
  last_bootstrap_at: string | null;
}

export const CrmSyncCard = () => {
  const qc = useQueryClient();
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["crm-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as CrmSettings | null;
    },
  });

  const bootstrap = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("brevo-bootstrap", {
        body: {},
      });
      if (error) throw error;
      return data;
    },
    onMutate: () => setIsBootstrapping(true),
    onSuccess: () => {
      toast.success("CRM lists & attributes synced with Brevo.");
      qc.invalidateQueries({ queryKey: ["crm-settings"] });
    },
    onError: (e: Error) => toast.error(e.message || "Bootstrap failed"),
    onSettled: () => setIsBootstrapping(false),
  });

  const ready = !!settings?.brevo_attributes_ready && !!settings?.brevo_list_booked;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Brevo CRM Sync
        </CardTitle>
        <CardDescription>
          Mirrors patient bookings into your Brevo CRM as Contacts and List membership.
          Run setup once to create the lists and custom attributes in your Brevo account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Badge variant="secondary">Loading…</Badge>
          ) : ready ? (
            <Badge className="bg-emerald-600 hover:bg-emerald-600">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" /> Setup required
            </Badge>
          )}
          {settings?.last_bootstrap_at && (
            <span className="text-xs text-muted-foreground">
              Last setup: {new Date(settings.last_bootstrap_at).toLocaleString()}
            </span>
          )}
        </div>

        {ready && (
          <div className="grid grid-cols-3 gap-3 text-sm">
            <ListChip label="Booked" id={settings?.brevo_list_booked} />
            <ListChip label="Active Patients" id={settings?.brevo_list_patients} />
            <ListChip label="Recovery" id={settings?.brevo_list_recovery} />
          </div>
        )}

        <Button
          onClick={() => bootstrap.mutate()}
          disabled={isBootstrapping}
          variant={ready ? "outline" : "default"}
        >
          {isBootstrapping && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {ready ? "Re-run setup" : "Run setup"}
        </Button>
      </CardContent>
    </Card>
  );
};

const ListChip = ({ label, id }: { label: string; id: number | null | undefined }) => (
  <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">List #{id ?? "—"}</p>
  </div>
);
