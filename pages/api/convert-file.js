// pages/api/convert-file.js
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const CONVERT_ENDPOINT = process.env.CONVERT_URL || "http://23.94.202.56:5000/convert";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.error("Invalid method: expected POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "Missing fileUrl" });
  }

  try {
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Job submitted",
      stage: "submitted",
      timestamp: new Date().toISOString(),
    }));

    const response = await fetch(CONVERT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const raw = await response.text();
    console.log("Flask response:", raw);

    if (!response.ok) {
      await redis.set(`status:${fileUrl}`, JSON.stringify({
        status: "Flask request failed",
        stage: "error",
        timestamp: new Date().toISOString(),
      }));
      return res.status(500).json({ error: "Failed to submit conversion job." });
    }

    const result = JSON.parse(raw);
    if (!result || (!result.pesUrl && !result.dstUrl)) {
      await redis.set(`status:${fileUrl}`, JSON.stringify({
        status: "Conversion failed",
        stage: "error",
        timestamp: new Date().toISOString(),
      }));
      return res.status(500).json({ error: "Conversion did not return output URLs." });
    }

    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Converted",
      stage: "done",
      timestamp: new Date().toISOString(),
      pesUrl: result.pesUrl || null,
      dstUrl: result.dstUrl || null,
    }));

    return res.status(200).json({
      message: "Conversion complete",
      pesUrl: result.pesUrl,
      dstUrl: result.dstUrl,
    });
  } catch (err) {
    console.error("Trigger error:", err);
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Trigger error",
      stage: "error",
      timestamp: new Date().toISOString(),
    }));
    return res.status(500).json({ error: "Failed to submit conversion job." });
  }
}