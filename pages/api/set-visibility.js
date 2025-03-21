import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client using updated env vars
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, visibility } = req.body;

  if (!fileUrl || !["public", "private"].includes(visibility)) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  try {
    await redis.hset(`file:${fileUrl}`, { visibility });
    return res.status(200).json({ message: "File visibility updated" });
  } catch (error) {
    console.error("Error updating file visibility:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}