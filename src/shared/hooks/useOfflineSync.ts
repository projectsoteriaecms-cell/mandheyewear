/**
 * Hook for managing offline sync state and triggers
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { offlineStorage, OperationType } from "@/services/offlineStorage";
import { syncQueue, SyncStatus } from "@/services/syncQueue";
import { useAuth } from "@/shared/hooks/useAuth";
import { useToast } from "@/shared/hooks/use-toast";

interface UseOfflineSyncReturn {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  triggerSync: () => Promise<void>;
  queueOperation: (
    operationType: OperationType,
    payload: Record<string, unknown>,
    tempId?: string
  ) => Promise<number | null>;
  clearQueue: () => Promise<void>;
}

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [pendingCount, setPendingCount] = useState(0);
  const lastSyncToastRef = useRef<string | null>(null);

  useEffect(() => {
    if (offlineStorage.constructor && typeof offlineStorage.init === "function") {
      offlineStorage.init().catch(console.error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = syncQueue.subscribe((status, count) => {
      setSyncStatus(status);
      setPendingCount(count);

      if (status === "success" && lastSyncToastRef.current !== "success") {
        toast({
          title: "Synced",
          description: "All offline changes have been saved.",
        });
        lastSyncToastRef.current = "success";

        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["poll-responses"] });
      } else if (status === "error" && lastSyncToastRef.current !== "error") {
        toast({
          title: "Sync Failed",
          description: "Some changes couldn't be saved. Will retry automatically.",
          variant: "destructive",
        });
        lastSyncToastRef.current = "error";
      } else if (status === "idle" || status === "syncing") {
        lastSyncToastRef.current = null;
      }
    });

    return () => unsubscribe();
  }, [toast, queryClient]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      if (user?.id) {
        toast({
          title: "Back Online",
          description: "Syncing your offline changes...",
        });
        syncQueue.processQueue(user.id).catch(console.error);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline",
        description: "Changes will be saved locally and synced when you're back online.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user?.id, toast]);

  useEffect(() => {
    if (user?.id) {
      offlineStorage.getPendingCount(user.id).then(setPendingCount).catch(console.error);
    } else {
      setPendingCount(0);
    }
  }, [user?.id]);

  const triggerSync = useCallback(async () => {
    if (!user?.id || !isOnline) return;
    await syncQueue.processQueue(user.id);
  }, [user?.id, isOnline]);

  const queueOperation = useCallback(
    async (
      operationType: OperationType,
      payload: Record<string, unknown>,
      tempId?: string
    ): Promise<number | null> => {
      if (!user?.id) return null;

      try {
        const id = await syncQueue.queueAndSync(
          operationType,
          payload,
          user.id,
          tempId,
          isOnline
        );

        const count = await offlineStorage.getPendingCount(user.id);
        setPendingCount(count);

        if (!isOnline) {
          toast({
            title: "Saved Offline",
            description: "This change will sync when you're back online.",
          });
        }

        return id;
      } catch (error) {
        console.error("Failed to queue operation:", error);
        toast({
          title: "Error",
          description: "Failed to save your change. Please try again.",
          variant: "destructive",
        });
        return null;
      }
    },
    [user?.id, isOnline, toast]
  );

  const clearQueue = useCallback(async () => {
    if (!user?.id) return;

    try {
      await offlineStorage.clearUserQueue(user.id);
      await offlineStorage.clearUserCache(user.id);
      setPendingCount(0);
      syncQueue.clearScheduledSync();
    } catch (error) {
      console.error("Failed to clear queue:", error);
    }
  }, [user?.id]);

  return {
    isOnline,
    syncStatus,
    pendingCount,
    triggerSync,
    queueOperation,
    clearQueue,
  };
};