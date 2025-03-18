import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// Create a Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,      // e.g. "https://usw1-xxxx-12345.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN,    // e.g. "************"
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Use lrange to retrieve all notifications for the current user
    const notifications = await redis.lrange(`notifications:${session.user.username}`, 0, -1);

    // Parse each notification from JSON
    const parsedNotifications = notifications.map((n) => JSON.parse(n));

    return res.status(200).json({ notifications: parsedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
}