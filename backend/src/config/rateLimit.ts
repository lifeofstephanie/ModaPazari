import rateLimit, { Options, Store } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";

/**
 * Rate-limit store factory. When REDIS_URL is set, limits are shared across all
 * instances via Redis (survives restarts, correct behind multiple dynos).
 * Otherwise falls back to express-rate-limit's in-memory store (fine for a
 * single instance; resets on deploy).
 */
let redis: Redis | null = null;

const buildStore = (): Store | undefined => {
  const url = process.env.REDIS_URL;
  if (!url) return undefined; // in-memory default
  if (!redis) {
    redis = new Redis(url, { maxRetriesPerRequest: null, lazyConnect: false });
    redis.on("error", (err) => console.error("[redis] rate-limit store error:", err.message));
  }
  return new RedisStore({
    // ioredis: forward the raw command so rate-limit-redis can script.
    sendCommand: (command: string, ...args: string[]) =>
      (redis as Redis).call(command, ...args) as Promise<any>,
  });
};

export const makeLimiter = (options: Partial<Options>) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    store: buildStore(),
    ...options,
  });
