/**
 * 캐시 레이어
 * - Upstash Redis 환경변수가 있으면 Redis 사용 (Vercel 배포)
 * - 없으면 in-memory fallback (로컬 개발)
 */

// ── In-memory fallback ──────────────────────────────────────────
const store = new Map<string, { value: unknown; expiresAt: number }>();

function memGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.value as T;
}

function memSet(key: string, value: unknown, ttlMs: number) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function memDel(key: string) {
  store.delete(key);
}

// ── Redis client (lazy init) ────────────────────────────────────
let redis: import("@upstash/redis").Redis | null = null;

function getRedis() {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const { Redis } = require("@upstash/redis");
  redis = new Redis({ url, token });
  return redis;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5분

// ── Public API ──────────────────────────────────────────────────
export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (r) {
    try {
      const val = await r.get<T>(key);
      return val ?? null;
    } catch {
      // Redis 오류 시 in-memory fallback
      return memGet<T>(key);
    }
  }
  return memGet<T>(key);
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlMs = DEFAULT_TTL_MS
) {
  const r = getRedis();
  if (r) {
    try {
      await r.set(key, value, { px: ttlMs });
      return;
    } catch {
      // Redis 오류 시 in-memory fallback
    }
  }
  memSet(key, value, ttlMs);
}

export async function cacheDel(key: string) {
  const r = getRedis();
  if (r) {
    try {
      await r.del(key);
      return;
    } catch {}
  }
  memDel(key);
}
