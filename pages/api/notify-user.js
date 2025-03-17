import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// 1. Instantiate your Upstash Redis client using env vars
const redis = new Redis({
  url: process.env.KV_REST_API_URL,     // from your Upstash Dashboard
  token: process.env.KV_REST_API_TOKEN, // from your Upstash Dashboard
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { recipient, message } = req.body;

  if (!recipient || !message) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // 2. Use 'redis.lpush(...)' instead of 'kv.lpush(...)'
  await redis.lpush(`notifications:${recipient}`, JSON.stringify({
    message,
    timestamp: new Date().toISOString(),
  }));

  return res.status(200).json({ message: "Notification sent" });
}