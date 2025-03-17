// /pages/api/get-comments.js (for example)

import { Redis } from "@upstash/redis";

// Instantiate your Upstash Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL,    // or whatever you call them
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  // Use redis.lrange(...) instead of kv.lrange(...)
  // Upstash returns an array of strings
  const rawComments = await redis.lrange(`comments:${fileUrl}`, 0, -1);
  // Parse each item from JSON if you stored them as JSON strings
  const comments = rawComments.map((item) => JSON.parse(item));

  return res.status(200).json({ comments });
}