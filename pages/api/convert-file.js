import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const CONVERT_ENDPOINT = process.env.CONVERT_URL || "http://23.94.202.56:5000/convert";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "Missing fileUrl" });
  }

  try {
    // Update Redis to indicate conversion is starting
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Queued for conversion",
      stage: "queued",
      timestamp: new Date().toISOString()
    }));

    // Fire and forget the conversion job to the VPS
    fetch(CONVERT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    }).then((r) => r.text()).then((t) => console.log("[convert-file] Flask async response:", t)).catch((err) => console.error("[convert-file] Async job error:", err));

    return res.status(202).json({ message: "Conversion job submitted." });
  } catch (err) {
    console.error("[convert-file] Unexpected error:", err);
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Dispatch error",
      stage: "error",
      timestamp: new Date().toISOString()
    }));
    return res.status(500).json({ error: "Failed to dispatch conversion job." });
  }
}
