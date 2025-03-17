// rate-limit.js (or wherever you keep this function)
// ❌ Remove: import { kv } from "@vercel/kv";
import { Redis } from "@upstash/redis";

// ✅ Create a Redis client (using environment variables)
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export const rateLimit = async (ip, limit = 10, timeframe = 60) => {
  const key = `rate-limit:${ip}`;

  // ✅ Upstash usage for "get"
  const currentCount = await redis.get(key);
  const count = currentCount ? parseInt(currentCount, 10) : 0;

  if (count >= limit) {
    return false;
  }

  // ✅ Upstash usage for "incr"
  await redis.incr(key);

  // ✅ Upstash usage for "expire"
  await redis.expire(key, timeframe);

  return true;
};