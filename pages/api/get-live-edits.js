import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  try {
    const edits = await redis.get(`live-edit:${fileUrl}`);
    return res.status(200).json({ edits: edits ? JSON.parse(edits) : [] });
  } catch (error) {
    console.error("Error fetching live edits:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}