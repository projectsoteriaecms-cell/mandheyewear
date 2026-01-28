/**
 * IndexedDB Service Layer for Offline-First Architecture
 * Manages sync queue and cached data stores
 */

const DB_NAME = "soteria-offline-v1";
const DB_VERSION = 1;

// Store names
export const STORES = {
  SYNC_QUEUE: "sync_queue",
  CACHED_DATA: "cached_data",
} as const;

// Operation types for sync queue
export type OperationType =
  | "cart_add"
  | "cart_update"
  | "cart_remove"
  | "cart_clear"
  | "wishlist_add"
  | "wishlist_remove"
  | "profile_update"
  | "poll_response"
  | "appointment_create"
  | "appointment_cancel";

// Sync queue item structure
export interface SyncQueueItem {
  id?: number; // Auto-increment
  operationType: OperationType;
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  status: "pending" | "processing" | "failed";
  tempId?: string; // Temporary local ID for optimistic updates
  userId: string;
}

// Cached data structure
export interface CachedDataItem<T = unknown> {
  key: string;
  data: T;
  updatedAt: number;
  userId: string;
}

// Conflict resolution strategies
export type ConflictStrategy = "server_wins" | "client_wins" | "merge" | "last_write_wins";

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create sync_queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: "id",
            autoIncrement: true,
          });
          syncStore.createIndex("status", "status", { unique: false });
          syncStore.createIndex("userId", "userId", { unique: false });
          syncStore.createIndex("operationType", "operationType", { unique: false });
          syncStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Create cached_data store
        if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
          const cacheStore = db.createObjectStore(STORES.CACHED_DATA, {
            keyPath: "key",
          });
          cacheStore.createIndex("userId", "userId", { unique: false });
          cacheStore.createIndex("updatedAt", "updatedAt", { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get database connection, initializing if needed
   */
  private async getDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // ==================== SYNC QUEUE OPERATIONS ====================

  /**
   * Add an operation to the sync queue
   */
  async queueOperation(
    operationType: OperationType,
    payload: Record<string, unknown>,
    userId: string,
    tempId?: string
  ): Promise<number> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SYNC_QUEUE], "readwrite");
      const store = transaction.objectStore(STORES.SYNC_QUEUE);

      const item: SyncQueueItem = {
        operationType,
        payload,
        createdAt: Date.now(),
        retryCount: 0,
        status: "pending",
        tempId,
        userId,
      };

      const request = store.add(item);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending operations for a user
   */
  async getPendingOperations(userId: string): Promise<SyncQueueItem[]> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SYNC_QUEUE], "readonly");
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const index = store.index("userId");
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const items = request.result as SyncQueueItem[];
        // Filter to only pending and failed (for retry)
        resolve(items.filter((item) => item.status === "pending" || item.status === "failed"));
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get count of pending operations
   */
  async getPendingCount(userId: string): Promise<number> {
    const pending = await this.getPendingOperations(userId);
    return pending.length;
  }

  /**
   * Update operation status
   */
  async updateOperationStatus(
    id: number,
    status: SyncQueueItem["status"],
    incrementRetry = false
  ): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SYNC_QUEUE], "readwrite");
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result as SyncQueueItem;
        if (!item) {
          reject(new Error(`Operation ${id} not found`));
          return;
        }

        item.status = status;
        if (incrementRetry) {
          item.retryCount += 1;
        }

        const updateRequest = store.put(item);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Remove a completed operation from the queue
   */
  async removeOperation(id: number): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SYNC_QUEUE], "readwrite");
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all operations for a user (used on logout)
   */
  async clearUserQueue(userId: string): Promise<void> {
    const db = await this.getDb();
    const pending = await this.getPendingOperations(userId);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SYNC_QUEUE], "readwrite");
      const store = transaction.objectStore(STORES.SYNC_QUEUE);

      let completed = 0;
      const total = pending.length;

      if (total === 0) {
        resolve();
        return;
      }

      pending.forEach((item) => {
        const request = store.delete(item.id!);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  // ==================== CACHED DATA OPERATIONS ====================

  /**
   * Cache data for offline access
   */
  async cacheData<T>(key: string, data: T, userId: string): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.CACHED_DATA], "readwrite");
      const store = transaction.objectStore(STORES.CACHED_DATA);

      const item: CachedDataItem<T> = {
        key: `${userId}:${key}`,
        data,
        updatedAt: Date.now(),
        userId,
      };

      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached data
   */
  async getCachedData<T>(key: string, userId: string): Promise<T | null> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.CACHED_DATA], "readonly");
      const store = transaction.objectStore(STORES.CACHED_DATA);
      const request = store.get(`${userId}:${key}`);

      request.onsuccess = () => {
        const item = request.result as CachedDataItem<T> | undefined;
        resolve(item?.data ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear cached data for a user
   */
  async clearUserCache(userId: string): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.CACHED_DATA], "readwrite");
      const store = transaction.objectStore(STORES.CACHED_DATA);
      const index = store.index("userId");
      const request = index.getAllKeys(userId);

      request.onsuccess = () => {
        const keys = request.result;
        let completed = 0;

        if (keys.length === 0) {
          resolve();
          return;
        }

        keys.forEach((key) => {
          const deleteRequest = store.delete(key);
          deleteRequest.onsuccess = () => {
            completed++;
            if (completed === keys.length) resolve();
          };
          deleteRequest.onerror = () => reject(deleteRequest.error);
        });
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data (used for testing or complete reset)
   */
  async clearAll(): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [STORES.SYNC_QUEUE, STORES.CACHED_DATA],
        "readwrite"
      );

      const syncStore = transaction.objectStore(STORES.SYNC_QUEUE);
      const cacheStore = transaction.objectStore(STORES.CACHED_DATA);

      syncStore.clear();
      cacheStore.clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Check if IndexedDB is supported
   */
  static isSupported(): boolean {
    return typeof indexedDB !== "undefined";
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService();
