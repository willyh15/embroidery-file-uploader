import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client using the correct environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,     // Corrected environment variable name
  token: process.env.KV_REST_API_TOKEN, // Corrected token reference
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  try {
    // Retrieve the stored edits from Redis (JSON-encoded)
    const editsString = await redis.get(`collab-edit:${fileUrl}`);

    // Parse the string back into JSON; default to an empty array if null
    const edits = editsString ? JSON.parse(editsString) : [];

    return res.status(200).json({ edits });
  } catch (error) {
    console.error("Error fetching collab-edit data:", error);
    return res.status(500).json({ error: "Failed to retrieve edits" });
  }
}
