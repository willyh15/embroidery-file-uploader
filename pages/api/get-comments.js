import { Redis } from "@upstash/redis";

// Instantiate your Upstash Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL,    // or your chosen variable name
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  try {
    // Use redis.lrange to retrieve all comments stored under the key "comments:<fileUrl>"
    const rawComments = await redis.lrange(`comments:${fileUrl}`, 0, -1);

    // Parse each comment (assuming they are stored as JSON strings)
    const comments = rawComments.map((item) => JSON.parse(item));

    return res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
}