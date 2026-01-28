
# Offline-First Sync System Implementation Plan

## Overview

This plan implements a robust offline-first architecture similar to Google Docs and Canva, where users can continue working even without internet connectivity. All changes are queued locally and automatically synchronized when connectivity is restored.

## Architecture

```text
+------------------+     +-------------------+     +------------------+
|   React App      |     |  Sync Service     |     |   Supabase       |
|                  |     |                   |     |                  |
|  User Actions    |---->|  IndexedDB Queue  |---->|  Database        |
|  (Cart, Wishlist |     |  + Retry Logic    |     |  + Edge Fn       |
|   Profile, etc)  |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
        ^                        |
        |                        v
        +-------- Optimistic UI Updates --------+
```

## What Will Work Offline

| Feature | Read (Cached) | Write (Queued) |
|---------|---------------|----------------|
| Cart operations | Yes (view cached cart) | Yes (add/remove queued) |
| Wishlist | Yes | Yes |
| Profile updates | Yes | Yes |
| Style quiz responses | Yes | Yes |
| Product browsing | Yes (cached products) | N/A |
| Appointments | Yes (view scheduled) | Yes (booking queued) |
| Orders | Yes (view history) | No (requires payment) |

## Implementation Components

### 1. IndexedDB Service Layer

A new service to handle local storage:

- **Stores**: `sync-queue`, `cached-data`, `pending-operations`
- **Operations**: Queue mutations, retrieve pending items, clear completed
- **Conflict Resolution**: Timestamp-based, last-write-wins for simple data

Location: `src/services/offlineStorage.ts`

### 2. Sync Queue Manager

Manages the queue of pending operations:

- Stores operation type, payload, timestamp, retry count
- Processes queue in order when online
- Handles failures with exponential backoff
- Maximum 5 retries before marking as failed

Location: `src/services/syncQueue.ts`

### 3. Enhanced usePWA Hook

Extend the existing hook:

- Add `pendingSyncCount` to show queued items
- Add `syncStatus`: 'idle' | 'syncing' | 'error'
- Trigger sync when connection restored
- Emit events for UI updates

Location: `src/hooks/usePWA.ts` (extend existing)

### 4. Offline-Aware Mutation Hooks

Wrapper pattern for existing hooks:

```text
useCart (current)
     |
     v
useOfflineCart (new wrapper)
     |
     +-- Online? --> Direct Supabase call
     |
     +-- Offline? --> Queue to IndexedDB + Optimistic update
```

### 5. Background Sync Edge Function

A backend function to process batched sync requests:

- Receives array of queued operations
- Processes in transaction
- Returns success/failure per operation
- Handles partial failures gracefully

Location: `supabase/functions/sync-offline-changes/index.ts`

### 6. UI Components

**Sync Status Indicator** - Shows pending changes count and sync status in the header/nav

**Offline Action Feedback** - Toast notifications: "Saved offline - will sync when connected"

**Sync Conflict Modal** - For rare cases where server data conflicts with local changes

## Detailed File Changes

### New Files

| File | Purpose |
|------|---------|
| `src/services/offlineStorage.ts` | IndexedDB wrapper with typed stores |
| `src/services/syncQueue.ts` | Queue management and processing |
| `src/hooks/useOfflineSync.ts` | React hook for sync state and triggers |
| `src/hooks/useOfflineMutation.ts` | Generic offline-aware mutation wrapper |
| `src/components/pwa/SyncStatusIndicator.tsx` | Visual sync status in UI |
| `src/components/pwa/OfflineActionToast.tsx` | Feedback for offline actions |
| `supabase/functions/sync-offline-changes/index.ts` | Batch sync processor |

### Modified Files

| File | Changes |
|------|---------|
| `src/hooks/usePWA.ts` | Add sync state, pending count |
| `src/hooks/useCart.ts` | Integrate offline queue for mutations |
| `src/hooks/useWishlist.ts` | Integrate offline queue for mutations |
| `src/hooks/useProfile.ts` | Integrate offline queue for updates |
| `src/hooks/useStylePolls.ts` | Integrate offline queue for responses |
| `src/hooks/useAppointments.ts` | Integrate offline queue for bookings |
| `src/components/pwa/index.ts` | Export new components |
| `src/App.tsx` | Add SyncStatusIndicator |
| `vite.config.ts` | Configure workbox for background sync |

## Data Flow Example: Adding to Cart Offline

```text
1. User clicks "Add to Cart" while offline

2. useOfflineCart hook:
   - Detects offline state via usePWA
   - Generates temporary local ID
   - Saves to IndexedDB sync queue:
     {
       id: "temp_123",
       operation: "cart_add",
       payload: { productId, quantity },
       timestamp: Date.now(),
       retries: 0,
       status: "pending"
     }
   - Updates React Query cache optimistically

3. User sees item in cart immediately

4. Connection restored (online event fires)

5. SyncQueue processes:
   - Calls sync-offline-changes edge function
   - Sends batched operations
   - Receives confirmation
   - Removes from IndexedDB queue
   - Invalidates React Query cache to fetch fresh data

6. Toast: "All changes synced successfully"
```

## Edge Function: sync-offline-changes

```text
POST /functions/v1/sync-offline-changes

Body:
{
  operations: [
    { type: "cart_add", payload: {...}, timestamp: 1234567890 },
    { type: "wishlist_add", payload: {...}, timestamp: 1234567891 },
    { type: "profile_update", payload: {...}, timestamp: 1234567892 }
  ]
}

Response:
{
  success: true,
  results: [
    { id: "temp_123", success: true, serverId: "real_abc" },
    { id: "temp_124", success: true, serverId: "real_def" },
    { id: "temp_125", success: false, error: "Validation failed" }
  ]
}
```

## Conflict Resolution Strategy

For this e-commerce context:

1. **Cart**: Server wins (inventory may have changed)
2. **Wishlist**: Merge (add any new items from both)
3. **Profile**: Last-write-wins with timestamp
4. **Poll Responses**: Last-write-wins with timestamp
5. **Appointments**: Server wins (time slots may be taken)

## Technical Considerations

### IndexedDB Schema

```text
Database: "soteria-offline-v1"

Store: sync_queue
  - id (primary key, auto-increment)
  - operation_type (cart_add, cart_remove, wishlist_add, etc.)
  - payload (JSON)
  - created_at (timestamp)
  - retry_count (number)
  - status (pending, processing, failed)

Store: cached_data
  - key (primary key: "cart_items", "wishlist", "profile")
  - data (JSON)
  - updated_at (timestamp)
```

### Service Worker Enhancement

Update workbox config in `vite.config.ts` to enable Background Sync API:

- Register sync event for `offline-sync-queue`
- Process queue even when app is closed
- Retry on network restoration

## Implementation Order

1. Create IndexedDB service layer
2. Build sync queue manager
3. Create batch sync edge function
4. Extend usePWA hook with sync state
5. Create useOfflineMutation wrapper hook
6. Integrate with useCart (as proof of concept)
7. Add UI indicators (SyncStatusIndicator, toasts)
8. Roll out to remaining hooks (wishlist, profile, polls)
9. Test edge cases (conflicts, partial failures)
10. Update service worker for background sync

## Security Considerations

- All operations require user authentication (JWT)
- Edge function validates user owns the data being synced
- No sensitive data stored in IndexedDB (just IDs and safe payloads)
- Sync queue cleared on logout

## Estimated Scope

- **New files**: 7
- **Modified files**: 10
- **Edge functions**: 1 new
- **Complexity**: Medium-High (IndexedDB, service workers, conflict handling)

