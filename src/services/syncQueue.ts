/**
 * Sync Queue Manager
 * Handles processing of queued offline operations with retry logic
 */

import { offlineStorage, SyncQueueItem, OperationType } from "./offlineStorage";
import { supabase } from "@/integrations/supabase/client";

// Maximum retry attempts before marking as failed
const MAX_RETRIES = 5;

// Base delay for exponential backoff (ms)
const BASE_DELAY = 1000;

// Sync result for each operation
export interface SyncResult {
  id: number;
  tempId?: string;
  success: boolean;
  serverId?: string;
  error?: string;
}

// Batch sync response from edge function
export interface BatchSyncResponse {
  success: boolean;
  results: SyncResult[];
  message?: string;
}

// Sync status
export type SyncStatus = "idle" | "syncing" | "error" | "success";

// Event callbacks
type SyncEventCallback = (status: SyncStatus, pendingCount: number) => void;

class SyncQueueManager {
  private isSyncing = false;
  private eventListeners: SyncEventCallback[] = [];
  private syncTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Subscribe to sync events
   */
  subscribe(callback: SyncEventCallback): () => void {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Emit sync event to all listeners
   */
  private emit(status: SyncStatus, pendingCount: number): void {
    this.eventListeners.forEach((cb) => cb(status, pendingCount));
  }

  /**
   * Calculate exponential backoff delay
   */
  private getRetryDelay(retryCount: number): number {
    return Math.min(BASE_DELAY * Math.pow(2, retryCount), 30000); // Max 30 seconds
  }

  /**
   * Process all pending operations for a user
   */
  async processQueue(userId: string): Promise<BatchSyncResponse> {
    if (this.isSyncing) {
      return { success: false, results: [], message: "Sync already in progress" };
    }

    // Check if online
    if (!navigator.onLine) {
      return { success: false, results: [], message: "Device is offline" };
    }

    this.isSyncing = true;
    this.emit("syncing", 0);

    try {
      const pendingOps = await offlineStorage.getPendingOperations(userId);

      if (pendingOps.length === 0) {
        this.emit("idle", 0);
        return { success: true, results: [], message: "No pending operations" };
      }

      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        this.emit("error", pendingOps.length);
        return { success: false, results: [], message: "Not authenticated" };
      }

      // Prepare operations for batch sync
      const operations = pendingOps.map((op) => ({
        id: op.id!,
        type: op.operationType,
        payload: op.payload,
        timestamp: op.createdAt,
        tempId: op.tempId,
      }));

      // Call edge function for batch sync
      const { data, error } = await supabase.functions.invoke("sync-offline-changes", {
        body: { operations },
      });

      if (error) {
        // Handle retry for failed operations
        for (const op of pendingOps) {
          if (op.retryCount < MAX_RETRIES) {
            await offlineStorage.updateOperationStatus(op.id!, "failed", true);
          }
        }

        const remaining = await offlineStorage.getPendingCount(userId);
        this.emit("error", remaining);
        
        // Schedule retry with exponential backoff
        this.scheduleRetry(userId, pendingOps[0]?.retryCount || 0);
        
        return {
          success: false,
          results: [],
          message: error.message || "Sync failed",
        };
      }

      const response = data as BatchSyncResponse;

      // Process individual results
      for (const result of response.results) {
        if (result.success) {
          await offlineStorage.removeOperation(result.id);
        } else {
          const op = pendingOps.find((o) => o.id === result.id);
          if (op && op.retryCount < MAX_RETRIES) {
            await offlineStorage.updateOperationStatus(result.id, "failed", true);
          }
        }
      }

      const remaining = await offlineStorage.getPendingCount(userId);
      this.emit(remaining === 0 ? "success" : "idle", remaining);

      return response;
    } catch (err) {
      const pendingCount = await offlineStorage.getPendingCount(userId);
      this.emit("error", pendingCount);
      return {
        success: false,
        results: [],
        message: err instanceof Error ? err.message : "Unknown error",
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Schedule a retry with exponential backoff
   */
  private scheduleRetry(userId: string, currentRetry: number): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    if (currentRetry >= MAX_RETRIES) return;

    const delay = this.getRetryDelay(currentRetry);
    console.log(`[SyncQueue] Scheduling retry in ${delay}ms (attempt ${currentRetry + 1})`);

    this.syncTimeout = setTimeout(() => {
      if (navigator.onLine) {
        this.processQueue(userId);
      }
    }, delay);
  }

  /**
   * Queue a new operation and optionally trigger immediate sync
   */
  async queueAndSync(
    operationType: OperationType,
    payload: Record<string, unknown>,
    userId: string,
    tempId?: string,
    immediateSync = true
  ): Promise<number> {
    const id = await offlineStorage.queueOperation(operationType, payload, userId, tempId);

    if (immediateSync && navigator.onLine) {
      // Don't await - let it run in background
      this.processQueue(userId).catch(console.error);
    } else {
      const pendingCount = await offlineStorage.getPendingCount(userId);
      this.emit("idle", pendingCount);
    }

    return id;
  }

  /**
   * Get current sync status
   */
  getStatus(): { isSyncing: boolean } {
    return { isSyncing: this.isSyncing };
  }

  /**
   * Clear pending sync timeout
   */
  clearScheduledSync(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
  }
}

// Export singleton instance
export const syncQueue = new SyncQueueManager();
