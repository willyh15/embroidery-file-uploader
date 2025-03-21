import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client using correct env variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  try {
    // Retrieve all keys matching "storage:*"
    const allKeys = await redis.keys("storage:*");
    const analytics = [];

    for (const key of allKeys) {
      const user = key.split(":")[1];
      const storageUsed = await redis.get(key);
      analytics.push({ user, storageUsed });
    }

    return res.status(200).json({ analytics });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
}