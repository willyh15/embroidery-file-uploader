import { Redis } from "@upstash/redis";

// Create a Redis client using your environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  try {
    // Retrieve all review items for the given fileUrl using redis.lrange(...)
    const rawReviews = await redis.lrange(`reviews:${fileUrl}`, 0, -1);

    // Parse each item from JSON
    const reviews = rawReviews.map((r) => JSON.parse(r));

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}