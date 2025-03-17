import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client using your environment variables
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

  const version = Date.now();

  try {
    // Use the Upstash Redis LPUSH command to add the version data to the list
    await redis.lpush(`versions:${fileUrl}`, JSON.stringify({ version, fileUrl }));
    return res.status(200).json({ message: "File version saved", version });
  } catch (error) {
    console.error("Error saving file version:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}