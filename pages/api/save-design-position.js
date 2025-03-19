import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,      // e.g., "https://usw1-something.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN,    // e.g., "xxxxxxx"
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, position } = req.body;

  if (!fileUrl || !position) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    // Convert the position object to a JSON string before storing it in Redis
    await redis.set(`design-position:${fileUrl}`, JSON.stringify(position));

    return res.status(200).json({ message: "Position saved" });
  } catch (error) {
    console.error("Error setting design position:", error);
    return res.status(500).json({ error: "Failed to save position" });
  }
}