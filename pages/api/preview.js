// /pages/api/preview.js
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  let fileUrl = req.method === "POST" ? req.body.fileUrl : req.query.fileUrl;

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
    } catch (err) {
      console.error("Failed to parse Redis preview data:", err);
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