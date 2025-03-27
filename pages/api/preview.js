// /pages/api/preview.js
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

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing fileUrl" });
  }

  try {
    const raw = await redis.get(`preview:${fileUrl}`);
    if (!raw) {
      return res.status(404).json({ error: "No preview available" });
    }

    let parsed;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return res.status(500).json({ error: "Corrupted preview data" });
    }

    return res.status(200).json({
      dstUrl: parsed.dstUrl || null,
      pesUrl: parsed.pesUrl || null,
      timestamp: parsed.timestamp || null,
    });
  } catch (err) {
    console.error("Error fetching preview from Redis:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}