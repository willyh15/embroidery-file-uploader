import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl, status } = req.body;

  if (!fileUrl || !status) {
    return res.status(400).json({ error: "Missing fileUrl or status" });
  }

  try {
    await redis.set(`status:${fileUrl}`, status);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to set Redis status:", err);
    res.status(500).json({ error: "Redis status update failed" });
  }
}