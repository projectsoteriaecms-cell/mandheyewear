/**
 * Hook for managing offline sync state and triggers
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { offlineStorage, OperationType } from "@/services/offlineStorage";
import { syncQueue, SyncStatus } from "@/services/syncQueue";
import { useAuth } from "@/shared/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

  // Initialize IndexedDB on mount
  useEffect(() => {
    if (offlineStorage.constructor && typeof offlineStorage.init === "function") {
      offlineStorage.init().catch(console.error);
    }
  }, []);

  // Subscribe to sync queue events
  useEffect(() => {
    const unsubscribe = syncQueue.subscribe((status, count) => {
      setSyncStatus(status);
      setPendingCount(count);

      // Show toast on sync completion
      if (status === "success" && lastSyncToastRef.current !== "success") {
        toast({
          title: "Synced",
          description: "All offline changes have been saved.",
        });
        lastSyncToastRef.current = "success";

        // Invalidate relevant queries to refresh data
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

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      // Trigger sync when coming back online
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

  // Load pending count on mount and user change
  useEffect(() => {
    if (user?.id) {
      offlineStorage.getPendingCount(user.id).then(setPendingCount).catch(console.error);
    } else {
      setPendingCount(0);
    }
  }, [user?.id]);

  // Trigger manual sync
  const triggerSync = useCallback(async () => {
    if (!user?.id || !isOnline) return;
    await syncQueue.processQueue(user.id);
  }, [user?.id, isOnline]);

  // Queue a new operation
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
          isOnline // Only immediate sync if online
        );

        // Update pending count
        const count = await offlineStorage.getPendingCount(user.id);
        setPendingCount(count);

        // Show feedback for offline actions
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

  // Clear queue (used on logout)
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
