/**
 * Runtime polyfills for browsers our users actually carry.
 *
 * The build target only transpiles *syntax* — it cannot backfill missing
 * runtime APIs shipped by dependencies. Anything added here must be imported
 * before the app renders (see main.tsx).
 */

// Object.hasOwn — Safari 15.4+ / Chrome 93+ / Firefox 92+.
// Used by bundled dependencies, so an older iPhone (iOS 14, early iOS 15)
// throws a TypeError and the whole chunk fails to run.
if (!(Object as unknown as { hasOwn?: unknown }).hasOwn) {
  Object.defineProperty(Object, "hasOwn", {
    value: (target: object, prop: PropertyKey) =>
      Object.prototype.hasOwnProperty.call(target, prop),
    configurable: true,
    writable: true,
  });
}

export {};
