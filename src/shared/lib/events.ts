/**
 * Platform event bus: modules emit events instead of calling each other's hooks directly.
 * Fire-and-forget: emitters don't wait for subscribers. Subscribers run independently.
 * No circular dependencies: auth → products → orders, never backwards.
 */

type EventListener<T = any> = (payload: T) => void | Promise<void>;

interface EventRegistry {
  [eventKey: string]: Set<EventListener>;
}

class EventBus {
  private listeners: EventRegistry = {};

  subscribe<T>(eventKey: string, listener: EventListener<T>): () => void {
    if (!this.listeners[eventKey]) {
      this.listeners[eventKey] = new Set();
    }
    this.listeners[eventKey].add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners[eventKey]?.delete(listener);
    };
  }

  emit<T>(eventKey: string, payload: T): void {
    const eventListeners = this.listeners[eventKey];
    if (!eventListeners) return;

    // Fire all listeners independently; don't await or error-gate
    for (const listener of eventListeners) {
      try {
        const result = listener(payload);
        // If listener returns a promise, fire and forget
        if (result instanceof Promise) {
          result.catch((err) => {
            // Log to observability but don't throw
            console.error(`[EventBus] ${eventKey} listener failed:`, err);
          });
        }
      } catch (err) {
        console.error(`[EventBus] ${eventKey} listener threw:`, err);
      }
    }
  }

  clear(): void {
    this.listeners = {};
  }
}

// Singleton instance
export const eventBus = new EventBus();

/**
 * Platform events — modules emit these, modules subscribe to these.
 * Event keys follow: domain.action (e.g., auth.user_logged_in, orders.order_created).
 * Emitters live where the action happens; subscribers live in modules that react to it.
 */
export const PlatformEvents = {
  // Auth module
  "auth.signup_completed": null as unknown as {
    userId: string;
    email: string;
  },
  "auth.email_verified": null as unknown as {
    userId: string;
    email: string;
  },
  "auth.login_completed": null as unknown as {
    userId: string;
    email: string;
  },
  "auth.logout": null as unknown as {
    userId: string;
  },

  // Orders module
  "orders.order_created": null as unknown as {
    orderId: string;
    userId: string;
    total: number;
  },
  "orders.order_completed": null as unknown as {
    orderId: string;
    userId: string;
  },

  // Products module
  "products.product_viewed": null as unknown as {
    productId: string;
    userId?: string;
    sessionId: string;
  },

  // Personalization module
  "personalization.profile_updated": null as unknown as {
    userId: string;
  },
  "personalization.tryon_completed": null as unknown as {
    /** Which try-on surface produced this: photo, live AR, or the inline modal. */
    source: string;
    /** Absent for Camera Kit captures where the frame is chosen inside the Lens. */
    frameId?: string;
    frameName?: string;
  },
} as const;

export type PlatformEventKey = keyof typeof PlatformEvents;

/**
 * Type-safe event emission. Catches typos at compile time.
 * Usage: emit("auth.login_completed", { userId, email })
 */
export function emit<K extends PlatformEventKey>(
  eventKey: K,
  payload: (typeof PlatformEvents)[K]
): void {
  eventBus.emit(eventKey, payload);
}

/**
 * Type-safe event subscription.
 * Usage: on("auth.login_completed", ({ userId, email }) => { ... })
 */
export function on<K extends PlatformEventKey>(
  eventKey: K,
  listener: EventListener<(typeof PlatformEvents)[K]>
): () => void {
  return eventBus.subscribe(eventKey, listener);
}
