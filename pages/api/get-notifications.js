import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// Create a Redis client using environment variables in your hosting environment
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,      // e.g. "https://usw1-xxxx-12345.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN   // e.g. "************"
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // With Upstash, you can use lrange for lists like so:
    // redis.lrange(key, start, stop)
    // returns array of items in the list
    const notifications = await redis.lrange(
      `notifications:${session.user.username}`,
      0,
      -1
    );

    // If each item is a serialized JSON string, parse each
    const parsedNotifications = notifications.map((n) => JSON.parse(n));

    return res.status(200).json({ notifications: parsedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
}