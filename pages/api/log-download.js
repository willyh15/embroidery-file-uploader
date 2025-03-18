import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Initialize Upstash Redis client with your environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  try {
    // Log the download by pushing a JSON string onto a Redis list keyed by the user's username.
    await redis.lpush(
      `downloads:${session.user.username}`,
      JSON.stringify({
        fileUrl,
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(200).json({ message: "Download logged" });
  } catch (error) {
    console.error("Error logging download:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}