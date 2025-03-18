import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Instantiate your Upstash Redis client with your environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,    // e.g., "https://xxxx.upstash.io"
  token: process.env.KV_REST_API_TOKEN, // e.g., "your_redis_token"
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, newContent } = req.body;

  if (!fileUrl || !newContent) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Use the Upstash Redis client to set the file content
  await redis.set(`file-content:${fileUrl}`, newContent);

  return res.status(200).json({ message: "File updated successfully" });
}