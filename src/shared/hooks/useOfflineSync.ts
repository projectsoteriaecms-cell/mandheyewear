import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { offlineStorage } from "@/services/offlineStorage";
import { syncQueue, SyncStatus } from "@/services/syncQueue";
import { useAuth } from "@/shared/hooks/useAuth";
import { useToast } from "@/shared/hooks/use-toast";

interface UseOfflineSyncProps {
  tableName: string;
  idKey: string;
  userIdKey: string;
  syncDebounce?: number;
  onSyncComplete?: () => void;
}

export const useOfflineSync = <T extends { id: string; user_id: string }>({
  tableName,
  idKey,
  userIdKey,
  syncDebounce = 500,
  onSyncComplete,
}: UseOfflineSyncProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const syncTimeout = useRef<NodeJS.Timeout | null>(null);

  const queueSync = useCallback(() => {
    if (syncTimeout.current) {
      clearTimeout(syncTimeout.current);
    }

    syncTimeout.current = setTimeout(() => {
      sync();
    }, syncDebounce);
  }, [syncDebounce, sync]);

  const sync = useCallback(async () => {
    if (!user) return;

    setIsSyncing(true);

    try {
      // 1. Get all local items
      const localItems = await offlineStorage.getAll<T>(tableName);

      // 2. Filter out items that are already synced
      const unsyncedItems = localItems.filter((item) => item.__syncStatus !== SyncStatus.Synced);

      if (unsyncedItems.length === 0) {
        console.log(`[${tableName}] No unsynced items`);
        return;
      }

      console.log(`[${tableName}] Syncing ${unsyncedItems.length} items`);

      // 3. Iterate through unsynced items and sync them
      for (const item of unsyncedItems) {
        try {
          if (item.__syncStatus === SyncStatus.Created) {
            const { data, error } = await supabase
              .from(tableName)
              .insert({ ...item, [userIdKey]: user.id })
              .select()
              .single();

            if (error) {
              console.error(`[${tableName}] Error creating item:`, item, error);
              await syncQueue.enqueue(tableName, item.id, "create");
              continue;
            }

            // Update local item with the synced data and status
            await offlineStorage.update<T>(tableName, item.id, {
              ...data,
              __syncStatus: SyncStatus.Synced,
            });
          } else if (item.__syncStatus === SyncStatus.Updated) {
            const { data, error } = await supabase
              .from(tableName)
              .update({ ...item, [userIdKey]: user.id })
              .eq(idKey, item.id)
              .select()
              .single();

            if (error) {
              console.error(`[${tableName}] Error updating item:`, item, error);
              await syncQueue.enqueue(tableName, item.id, "update");
              continue;
            }

            // Update local item with the synced data and status
            await offlineStorage.update<T>(tableName, item.id, {
              ...data,
              __syncStatus: SyncStatus.Synced,
            });
          } else if (item.__syncStatus === SyncStatus.Deleted) {
            const { error } = await supabase.from(tableName).delete().eq(idKey, item.id);

            if (error) {
              console.error(`[${tableName}] Error deleting item:`, item, error);
              await syncQueue.enqueue(tableName, item.id, "delete");
              continue;
            }

            // Remove local item
            await offlineStorage.remove(tableName, item.id);
          }
        } catch (err) {
          console.error(`[${tableName}] Sync error for item ${item.id}:`, err);
          await syncQueue.enqueue(tableName, item.id, item.__syncStatus === SyncStatus.Created ? "create" : item.__syncStatus === SyncStatus.Updated ? "update" : "delete");
        }
      }

      setLastSync(new Date());
      toast({
        title: "Offline Sync Complete",
        description: `Successfully synced ${unsyncedItems.length} ${tableName} items.`,
      });
      onSyncComplete?.();
    } catch (error) {
      console.error(`[${tableName}] Sync failed:`, error);
      toast({
        title: "Offline Sync Failed",
        description: `Failed to sync ${tableName} data. Will retry later.`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [tableName, idKey, userIdKey, user, toast, onSyncComplete]);

  useEffect(() => {
    if (user) {
      // Initial sync on mount
      sync();

      // Listen for online events to trigger sync
      window.addEventListener("online", queueSync);
    }

    return () => {
      window.removeEventListener("online", queueSync);
      if (syncTimeout.current) {
        clearTimeout(syncTimeout.current);
      }
    };
  }, [user, sync, queueSync]);

  return { isSyncing, lastSync, sync };
};
