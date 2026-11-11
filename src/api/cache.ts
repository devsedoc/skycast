interface Entry<V> {
  expires: number;
  value: V;
}

/** Tiny in-memory cache with per-entry TTL and a max size (oldest entry evicted first). */
export class TtlCache<V> {
  private readonly store = new Map<string, Entry<V>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;
  private readonly now: () => number;

  constructor(ttlMs: number, maxEntries = 100, now: () => number = Date.now) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.now = now;
  }

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expires <= this.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: V): void {
    this.store.delete(key);
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { expires: this.now() + this.ttlMs, value });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

/**
 * Return a cached promise for `key`, or start `load()` and cache its promise.
 * Caching the promise (not the value) also de-duplicates concurrent requests.
 * Failed requests are evicted so they can be retried.
 */
export function cachedPromise<V>(
  cache: TtlCache<Promise<V>>,
  key: string,
  load: () => Promise<V>,
): Promise<V> {
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = load().catch((err: unknown) => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, promise);
  return promise;
}
