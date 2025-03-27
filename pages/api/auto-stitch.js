// /pages/api/auto-stitch.js
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  const autoStitchUrl = process.env.AUTO_STITCH_URL;
  if (!autoStitchUrl) {
    return res.status(500).json({ error: "Auto stitch API URL not configured" });
  }

  try {
    // Set Redis status: starting auto-stitch
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Starting auto-stitch",
      stage: "auto-stitching",
      timestamp: new Date().toISOString()
    }));

    const response = await fetch(autoStitchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      await redis.set(`status:${fileUrl}`, JSON.stringify({
        status: "Auto-stitch failed",
        stage: "error",
        timestamp: new Date().toISOString()
      }));
      return res.status(500).json({ error: data?.error || "Auto-stitch failed" });
    }

    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Auto-stitch complete",
      stage: "done",
      timestamp: new Date().toISOString()
    }));

    return res.status(200).json({
      autoStitchedFile: data.auto_stitched_file,
    });
  } catch (error) {
    console.error("Auto-stitch error:", error);
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Internal error (auto-stitch)",
      stage: "error",
      timestamp: new Date().toISOString()
    }));
    return res.status(500).json({ error: "Failed to process auto-stitch" });
  }
}