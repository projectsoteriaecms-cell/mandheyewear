# Module Contracts & Events

A **module contract** is the public API surface through which other modules interact with it. By enforcing contracts, we ensure modules can be swapped, tested, and evolved independently.

## Three Layers of a Module

### 1. Public API (index.ts)
- Only place other modules can import from
- Re-exports hooks, components, types from internal folders
- Explicit and minimal — only what other modules need

```ts
// src/modules/auth/index.ts
export { useAuth, useAuthSession } from './hooks';
export { RoleGuard } from './components';
export type { AppRole, User } from './types';
// NOT exporting internals like useAuthHook, _internal, authClient
```

### 2. Internal Implementation
- Modules live behind their public API
- Can refactor internals without breaking other modules
- Hooks, components, utils, types — organized as needed

### 3. Event Stream (optional)
- Modules emit events when something significant happens
- Other modules subscribe to react, without calling hooks
- Breaks circular dependencies

## The Event Pattern: No Hook Calls Between Modules

**Before (tight coupling):**
```ts
// orders/components/Checkout.tsx — imports auth hook directly
import { useAuth } from '@/modules/auth/hooks';

export function Checkout() {
  const { user } = useAuth(); // Reaches into auth's internal structure
  // ...
}
```

**After (decoupled via events):**
```ts
// orders/components/Checkout.tsx — only uses index.ts
import { useAuth } from '@/modules/auth';

// auth/hooks/useAuth.ts emits the event:
export function useAuth() {
  const auth = useAuthSession();
  useEffect(() => {
    if (auth.user) {
      emit('auth.login_completed', { userId: auth.user.id, email: auth.user.email });
    }
  }, [auth.user]);
  return auth;
}

// orders/hooks/useCheckout.ts subscribes to the event:
export function useCheckout() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    return on('auth.login_completed', ({ userId }) => {
      setUserId(userId);
    });
  }, []);

  return { /* ... */ };
}
```

## Event Guidelines

### Emitting (the module that owns the action)
- Emit after the action is **committed** (DB write done, side effects complete)
- Fire-and-forget: don't await subscribers
- Include minimal, immutable payload (IDs, not full objects)

```ts
// In auth/hooks/useAuth.ts
const handleLoginSuccess = async (user: User) => {
  await saveSession(user);
  emit('auth.login_completed', {
    userId: user.id,
    email: user.email,
  });
};
```

### Subscribing (modules that need to react)
- Subscribe in hooks, not components (so cleanup happens automatically)
- Use `on()` which returns an unsubscribe function (cleanup on unmount)
- Handle async work; errors won't bubble up

```ts
// In orders/hooks/useCheckout.ts
export function useCheckout() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Listener runs when auth.login_completed fires
    return on('auth.login_completed', ({ userId }) => {
      setCurrentUserId(userId);
    });
  }, []);

  return { currentUserId };
}
```

## Module Dependency Graph

Modules form a **DAG** (directed acyclic graph) — no cycles allowed.

```
Auth (bottom layer — no dependencies)
  ↑
  ├─ Orders (depends on auth for user context)
  ├─ Products (independent; listened to by Orders)
  └─ Personalization (listens to auth for profile setup)

Orders listens to:
  - auth.login_completed (to fetch user's orders)

Personalization listens to:
  - auth.signup_completed (to initialize profile)
```

## Migration Checklist: One Module at a Time

1. **Identify outbound dependencies**: What does this module import from other modules?
2. **Map to events**: For each import, is there an event that could replace it?
3. **Add event subscriptions**: In the hooks that need that data, subscribe via `on()`
4. **Remove hook imports**: Delete the `useX` import and the module dep
5. **Emit from the upstream module**: Ensure the upstream module emits when needed
6. **Test**: Verify the hook still works and data flows correctly

Example: Orders module stops calling `useAuth()` directly, subscribes to `auth.login_completed` instead.

## Testing

For unit tests, mock the event bus:

```ts
import { on } from '@/shared/lib/events';

describe('useCheckout', () => {
  it('loads user context when auth emits login', () => {
    const mockListener = jest.fn();
    on('auth.login_completed', mockListener);

    render(<CheckoutHook />);
    expect(mockListener).toHaveBeenCalled();
  });
});
```

For integration tests, let events flow naturally — no mocking needed.
