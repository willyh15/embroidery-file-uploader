// /pages/api/log-download.js
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl, format } = req.body;

  if (!fileUrl || !format) {
    return res.status(400).json({ error: "Missing fileUrl or format" });
  }

  try {
    const timestamp = new Date().toISOString();
    await Promise.all([
      redis.lpush(`downloads:${fileUrl}`, JSON.stringify({ type: format, timestamp })),
      redis.incr(`downloadCount:${fileUrl}`),
    ]);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Download log error:", err);
    return res.status(500).json({ error: "Failed to log download" });
  }
}