/**
 * Generic offline-aware mutation wrapper
 * Provides optimistic updates with offline queue fallback
 */

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOfflineSync } from "./useOfflineSync";
import { OperationType } from "@/services/offlineStorage";

interface UseOfflineMutationOptions<TData, TVariables> {
  // The operation type for the sync queue
  operationType: OperationType;

  // Transform variables into payload for the queue
  getPayload: (variables: TVariables) => Record<string, unknown>;

  // The actual mutation function (called when online)
  mutationFn: (variables: TVariables) => Promise<TData>;

  // Query keys to invalidate on success
  queryKeysToInvalidate?: string[][];

  // Optimistic update function
  optimisticUpdate?: (
    variables: TVariables,
    queryClient: ReturnType<typeof useQueryClient>
  ) => void;

  // Rollback function if offline queue fails
  rollbackUpdate?: (
    variables: TVariables,
    queryClient: ReturnType<typeof useQueryClient>
  ) => void;

  // Callbacks
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onOfflineQueued?: (variables: TVariables) => void;
}

interface UseOfflineMutationReturn<TVariables> {
  mutate: (variables: TVariables) => Promise<void>;
  isOnline: boolean;
  pendingCount: number;
}

export function useOfflineMutation<TData = unknown, TVariables = unknown>(
  options: UseOfflineMutationOptions<TData, TVariables>
): UseOfflineMutationReturn<TVariables> {
  const queryClient = useQueryClient();
  const { isOnline, pendingCount, queueOperation } = useOfflineSync();

  const {
    operationType,
    getPayload,
    mutationFn,
    queryKeysToInvalidate = [],
    optimisticUpdate,
    rollbackUpdate,
    onSuccess,
    onError,
    onOfflineQueued,
  } = options;

  const mutate = useCallback(
    async (variables: TVariables) => {
      // Apply optimistic update immediately
      if (optimisticUpdate) {
        optimisticUpdate(variables, queryClient);
      }

      if (isOnline) {
        // Online: Execute mutation directly
        try {
          const result = await mutationFn(variables);

          // Invalidate queries
          for (const keys of queryKeysToInvalidate) {
            queryClient.invalidateQueries({ queryKey: keys });
          }

          onSuccess?.(result, variables);
        } catch (error) {
          // Rollback optimistic update on error
          if (rollbackUpdate) {
            rollbackUpdate(variables, queryClient);
          }

          onError?.(error as Error, variables);
        }
      } else {
        // Offline: Queue the operation
        const payload = getPayload(variables);
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const queued = await queueOperation(operationType, payload, tempId);

        if (queued) {
          onOfflineQueued?.(variables);
        } else {
          // Failed to queue, rollback
          if (rollbackUpdate) {
            rollbackUpdate(variables, queryClient);
          }
          onError?.(new Error("Failed to queue offline operation"), variables);
        }
      }
    },
    [
      isOnline,
      mutationFn,
      queryClient,
      queryKeysToInvalidate,
      optimisticUpdate,
      rollbackUpdate,
      onSuccess,
      onError,
      onOfflineQueued,
      queueOperation,
      operationType,
      getPayload,
    ]
  );

  return {
    mutate,
    isOnline,
    pendingCount,
  };
}
