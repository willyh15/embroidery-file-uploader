// /pages/api/get-download-stats.js
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
    const [count, logsRaw] = await Promise.all([
      redis.get(`downloadCount:${fileUrl}`),
      redis.lrange(`downloads:${fileUrl}`, 0, 4),
    ]);

    const logs = logsRaw.map((entry) => {
      try {
        return JSON.parse(entry);
      } catch {
        return { type: "unknown", timestamp: entry };
      }
    });

    return res.status(200).json({
      count: count || 0,
      logs,
    });
  } catch (err) {
    console.error("Failed to fetch download stats:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}