// utils/redisClient.js
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL,    // Ensure these env variables are set in your deployment
  token: process.env.KV_REST_API_TOKEN,
});