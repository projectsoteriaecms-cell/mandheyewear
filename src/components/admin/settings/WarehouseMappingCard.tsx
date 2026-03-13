import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowsClockwise, MapPin, Warning, Check } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useAllBranches } from "@/modules/branches/hooks/useBranches";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ZohoWarehouse {
  location_id: string;
  location_name: string;
  is_primary?: boolean;
  status?: string;
}

interface WarehouseMapping {
  id: string;
  zoho_location_id: string;
  zoho_location_name: string | null;
  branch_id: string;
}

const WarehouseMappingCard = () => {
  const [zohoWarehouses, setZohoWarehouses] = useState<ZohoWarehouse[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localMappings, setLocalMappings] = useState<Record<string, string>>({});
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

  // Initialize local mappings from DB
  useEffect(() => {
    if (existingMappings) {
      const map: Record<string, string> = {};
      for (const m of existingMappings) {
        map[m.zoho_location_id] = m.branch_id;
      }
      setLocalMappings(map);
    }
  }, [existingMappings]);

  const fetchWarehouses = async () => {
    setLoadingWarehouses(true);
    try {
      const { data, error } = await supabase.functions.invoke("zoho-sync", {
        body: { action: "list_warehouses" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setZohoWarehouses(data.warehouses || []);
      if (data.warehouses?.length === 0) {
        toast.info("No warehouses found in Zoho Books");
      } else {
        toast.success(`Found ${data.warehouses.length} warehouses from Zoho`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch warehouses";
      toast.error(message);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const handleMappingChange = (locationId: string, branchId: string) => {
    setLocalMappings((prev) => ({ ...prev, [locationId]: branchId }));
  };

  const saveMappings = async () => {
    setSaving(true);
    try {
      // For each Zoho warehouse with a mapping, upsert
      for (const wh of zohoWarehouses) {
        const branchId = localMappings[wh.location_id];
        if (!branchId) continue;

        const existing = existingMappings?.find((m) => m.zoho_location_id === wh.location_id);
        if (existing) {
          await supabase
            .from("zoho_warehouse_mapping")
            .update({ branch_id: branchId, zoho_location_name: wh.location_name })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("zoho_warehouse_mapping")
            .insert({
              zoho_location_id: wh.location_id,
              zoho_location_name: wh.location_name,
              branch_id: branchId,
            });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["zoho-warehouse-mappings"] });
      toast.success("Warehouse mappings saved");
    } catch (err) {
      toast.error("Failed to save mappings");
    } finally {
      setSaving(false);
    }
  };

  const unmappedCount = zohoWarehouses.filter((wh) => !localMappings[wh.location_id]).length;
  const mappedCount = zohoWarehouses.filter((wh) => localMappings[wh.location_id]).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin weight="duotone" className="h-5 w-5" />
          Zoho Warehouse Mapping
        </CardTitle>
        <CardDescription>
          Map Zoho Books warehouses to local branches for stock synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fetch button */}
        <div className="flex items-center gap-3">
          <Button onClick={fetchWarehouses} disabled={loadingWarehouses} variant="outline" size="sm">
            <ArrowsClockwise className={`h-4 w-4 mr-2 ${loadingWarehouses ? "animate-spin" : ""}`} />
            {zohoWarehouses.length > 0 ? "Refresh Warehouses" : "Fetch Zoho Warehouses"}
          </Button>
          {zohoWarehouses.length > 0 && (
            <div className="flex gap-2">
              <Badge variant="secondary">{mappedCount} mapped</Badge>
              {unmappedCount > 0 && (
                <Badge variant="destructive">{unmappedCount} unmapped</Badge>
              )}
            </div>
          )}
        </div>

        {/* Existing mappings when no warehouses fetched */}
        {zohoWarehouses.length === 0 && !loadingWarehouses && (
          <>
            {loadingMappings ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : existingMappings && existingMappings.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current mappings:</p>
                {existingMappings.map((m) => {
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
            ) : (
              <p className="text-sm text-muted-foreground">
                Click "Fetch Zoho Warehouses" to discover available warehouses and map them to your branches.
                Stock sync requires at least one mapping to work.
              </p>
            )}
          </>
        )}

        {/* Loading state */}
        {loadingWarehouses && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {/* Warehouse list with branch selectors */}
        {zohoWarehouses.length > 0 && !loadingWarehouses && (
          <div className="space-y-3">
            {zohoWarehouses.map((wh) => (
              <div key={wh.location_id} className="flex items-center gap-3 rounded-md border p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{wh.location_name}</p>
                  <p className="text-xs text-muted-foreground">ID: {wh.location_id}</p>
                </div>
                {!localMappings[wh.location_id] && (
                  <Warning className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <Select
                  value={localMappings[wh.location_id] || ""}
                  onValueChange={(val) => handleMappingChange(wh.location_id, val)}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select branch..." />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            <Button onClick={saveMappings} disabled={saving || mappedCount === 0}>
              {saving ? "Saving..." : "Save Mappings"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WarehouseMappingCard;
