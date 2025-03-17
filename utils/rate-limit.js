// utils/rateLimit.js
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export const rateLimit = async (ip, limit = 10, timeframe = 60) => {
  const key = `rate-limit:${ip}`;
  const currentCount = await redis.get(key);
  const count = currentCount ? parseInt(currentCount, 10) : 0;

  if (count >= limit) {
    return false;
  }

  await redis.incr(key);
  await redis.expire(key, timeframe);

  return true;
};