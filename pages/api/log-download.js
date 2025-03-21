import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Initialize Upstash Redis client with correct env variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
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