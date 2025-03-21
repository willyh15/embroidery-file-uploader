import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client using new environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
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