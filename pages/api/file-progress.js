// pages/api/file-progress.js
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing fileUrl" });
  }

  try {
    const key = `progress:${fileUrl}`;
    const progress = await redis.get(key);
    res.status(200).json({ progress: progress || 0 });
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}