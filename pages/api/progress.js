// /pages/api/progress.js
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.query;
  if (!fileUrl) return res.status(400).json({ error: "Missing fileUrl" });

  try {
    const [progress, rawStatus] = await Promise.all([
      redis.get(`progress:${fileUrl}`),
      redis.get(`status:${fileUrl}`),
    ]);

    let parsedStatus = { status: "Pending", stage: "pending", timestamp: null };
    if (typeof rawStatus === "string") {
      try {
        parsedStatus = JSON.parse(rawStatus);
      } catch (err) {
        parsedStatus = { status: rawStatus, stage: "unknown", timestamp: null };
      }
    }

    return res.status(200).json({
      progress: progress !== null ? Number(progress) : 0,
      status: parsedStatus.status,
      stage: parsedStatus.stage,
      timestamp: parsedStatus.timestamp,
    });
  } catch (err) {
    console.error("Redis polling error:", err);
    return res.status(500).json({ error: "Redis polling failed" });
  }
}
