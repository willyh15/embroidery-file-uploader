import { Redis } from "@upstash/redis";

// Create a Redis client instance using Upstash credentials from environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,     // e.g. "https://usw1-fancy-12345.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN, // e.g. "************"
});

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  try {
    // Retrieve the string value (JSON-encoded) from Upstash Redis
    const editsString = await redis.get(`collab-edit:${fileUrl}`);

    // If it exists, parse back into JSON; otherwise default to an empty array
    const edits = editsString ? JSON.parse(editsString) : [];

    return res.status(200).json({ edits });
  } catch (error) {
    console.error("Error fetching collab-edit data:", error);
    return res.status(500).json({ error: "Failed to retrieve edits" });
  }
}