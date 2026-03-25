const store = new Map<string, { value: unknown; expiresAt: number }>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.value as T;
}

export function cacheSet(key: string, value: unknown, ttlMs = 5 * 60 * 1000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheDel(key: string) {
  store.delete(key);
}
