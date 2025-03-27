// pages/api/progress.js
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const { fileUrl } = req.query;
  if (!fileUrl) return res.status(400).json({ error: "Missing fileUrl" });

  try {
    const progress = await redis.get(`progress:${fileUrl}`);
    return res.status(200).json({ progress: Number(progress) || 0 });
  } catch (err) {
    console.error("Redis progress fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch progress" });
  }
}