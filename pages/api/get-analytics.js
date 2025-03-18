import { Redis } from "@upstash/redis";

// Initialize your Upstash Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,     // e.g. "https://usw1-fancy-12345.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN,   // e.g. "************"
});

export default async function handler(req, res) {
  try {
    // Retrieve all keys matching "storage:*"
    const allKeys = await redis.keys("storage:*");
    const analytics = [];

    // For each key, extract the username and get the storage used
    for (const key of allKeys) {
      // Assuming keys are structured as "storage:<username>"
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