/**
 * Return the usable exports of a CommonJS package loaded with `await import()`.
 *
 * Node exposes CJS named exports only when its static analysis detects them, and
 * that detection differs between Node versions: @zxing/library exposes its classes
 * as named exports locally but only under `default` in the production image.
 * `probeExport` is a name the caller needs, used to pick the right shape.
 */
export function resolveCjsModule<T = any>(namespace: Record<string, any>, probeExport: string): T {
  if (namespace?.[probeExport] !== undefined) return namespace as T;
  if (namespace?.default?.[probeExport] !== undefined) return namespace.default as T;
  throw new Error(`Module does not export ${probeExport}`);
}
