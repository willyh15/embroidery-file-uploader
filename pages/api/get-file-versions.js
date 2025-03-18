import { Redis } from "@upstash/redis";

// Instantiate your Upstash Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL, // from your Upstash Dashboard
  token: process.env.KV_REST_API_TOKEN, // from your Upstash Dashboard
});

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  try {
    // Use redis.lrange() to retrieve all versions stored under the key "versions:<fileUrl>"
    const versions = await redis.lrange(`versions:${fileUrl}`, 0, -1);
    // Parse each version from JSON (assuming they were stored as JSON strings)
    return res.status(200).json({ versions: versions.map((v) => JSON.parse(v)) });
  } catch (error) {
    console.error("Error fetching versions:", error);
    return res.status(500).json({ error: "Failed to fetch versions" });
  }
}