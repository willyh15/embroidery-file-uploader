// pages/api/get-download-stats.js
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
    const [count, logs] = await Promise.all([
      redis.get(`downloadCount:${fileUrl}`),
      redis.lrange(`downloads:${fileUrl}`, 0, 9), // last 10 entries
    ]);

    const parsedLogs = logs.map((entry) => {
      try {
        return JSON.parse(entry);
      } catch {
        return { error: "Failed to parse log entry", raw: entry };
      }
    });

    res.status(200).json({ count: count || 0, logs: parsedLogs });
  } catch (err) {
    console.error("Error fetching download stats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
