import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowsClockwise, MapPin, Check, Package } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useAllBranches } from "@/modules/branches";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface WarehouseMapping {
  id: string;
  zoho_location_id: string;
  zoho_location_name: string | null;
  branch_id: string;
}

const WarehouseMappingCard = () => {
  const [saving, setSaving] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const { data: branches } = useAllBranches();
  const queryClient = useQueryClient();

  const { data: existingMappings, isLoading: loadingMappings } = useQuery({
    queryKey: ["zoho-warehouse-mappings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zoho_warehouse_mapping")
        .select("*");
      if (error) throw error;
      return data as WarehouseMapping[];
    },
  });

  // Initialize from existing __default__ mapping
  useEffect(() => {
    if (existingMappings) {
      const defaultMapping = existingMappings.find((m) => m.zoho_location_id === "__default__");
      if (defaultMapping) {
        setSelectedBranchId(defaultMapping.branch_id);
      }
    }
  }, [existingMappings]);

  const saveDefaultBranch = async () => {
    if (!selectedBranchId) {
      toast.error("Please select a branch");
      return;
    }

    setSaving(true);
    try {
      const existing = existingMappings?.find((m) => m.zoho_location_id === "__default__");
      const branchName = branches?.find((b) => b.id === selectedBranchId)?.name || "Unknown";

      if (existing) {
        await supabase
          .from("zoho_warehouse_mapping")
          .update({ branch_id: selectedBranchId, zoho_location_name: "Default Stock Branch" })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("zoho_warehouse_mapping")
          .insert({
            zoho_location_id: "__default__",
            zoho_location_name: "Default Stock Branch",
            branch_id: selectedBranchId,
          });
      }

      queryClient.invalidateQueries({ queryKey: ["zoho-warehouse-mappings"] });
      toast.success(`Default stock branch set to ${branchName}`);
    } catch (err) {
      toast.error("Failed to save default branch");
    } finally {
      setSaving(false);
    }
  };

  const currentDefault = existingMappings?.find((m) => m.zoho_location_id === "__default__");
  const currentBranch = currentDefault ? branches?.find((b) => b.id === currentDefault.branch_id) : null;

  // Other (non-default) mappings for display
  const otherMappings = existingMappings?.filter((m) => m.zoho_location_id !== "__default__") || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package weight="duotone" className="h-5 w-5" />
          Stock Sync Configuration
        </CardTitle>
        <CardDescription>
          Configure which branch receives stock levels from Zoho Books when syncing inventory
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingMappings ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <>
            {/* Current status */}
            {currentBranch && (
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  Stock levels sync to: <strong>{currentBranch.name}</strong>
                </span>
              </div>
            )}

            {/* Default branch selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Stock Branch</label>
              <p className="text-xs text-muted-foreground">
                All Zoho Books stock quantities will be assigned to this branch during sync.
              </p>
              <div className="flex items-center gap-3">
                <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select branch..." />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} {branch.is_head_office ? "(Head Office)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={saveDefaultBranch} disabled={saving || !selectedBranchId} size="sm">
                  {saving ? (
                    <ArrowsClockwise className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            {/* Show other warehouse mappings if any */}
            {otherMappings.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-sm text-muted-foreground">Per-warehouse mappings:</p>
                {otherMappings.map((m) => {
                  const branch = branches?.find((b) => b.id === m.branch_id);
                  return (
                    <div key={m.id} className="flex items-center justify-between rounded-md border p-3">
                      <span className="text-sm font-medium">{m.zoho_location_name || m.zoho_location_id}</span>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-muted-foreground">{branch?.name || "Unknown branch"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!currentBranch && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>No default branch set.</strong> Select a branch above and save to enable stock syncing.
                  Then use the "Sync Stock" button on the Products page.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WarehouseMappingCard;
