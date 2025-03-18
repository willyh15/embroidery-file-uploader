import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Create a Redis client instance using Upstash credentials from environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,     // e.g., "https://usw1-fancy-12345.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN,   // e.g., "*********************************"
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Use redis.lrange to retrieve all audit log entries for the current user.
    // Upstash returns an array of strings.
    const logs = await redis.lrange(`audit:${session.user.username}`, 0, -1);

    return res.status(200).json({ logs });
  } catch (error) {
    console.error("Error fetching logs from Redis:", error);
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
}