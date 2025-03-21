import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Initialize Redis client with updated environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const logs = await redis.lrange(`audit:${session.user.username}`, 0, -1);
    return res.status(200).json({ logs });
  } catch (error) {
    console.error("Error fetching logs from Redis:", error);
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
}