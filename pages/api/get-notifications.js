import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

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
    const notifications = await redis.lrange(`notifications:${session.user.username}`, 0, -1);
    const parsedNotifications = notifications.map((n) => JSON.parse(n));

    return res.status(200).json({ notifications: parsedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
}