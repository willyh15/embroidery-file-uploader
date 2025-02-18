import { kv } from "@vercel/kv";

export const rateLimit = async (ip, limit = 10, timeframe = 60) => {
  const key = `rate-limit:${ip}`;
  const currentCount = await kv.get(key) || 0;

  if (currentCount >= limit) {
    return false;
  }

  await kv.incr(key);
  await kv.expire(key, timeframe);
  return true;
};