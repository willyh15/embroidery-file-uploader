// /pages/api/convert-file.js
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
    return res.status(400).json({ error: "Missing fileUrl" });
  }

  try {
    // Step 1: Mark status as "converting"
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Starting conversion",
      stage: "converting",
      timestamp: new Date().toISOString()
    }));

    // Step 2: Call your VPS conversion endpoint
    const response = await fetch("http://YOUR_VPS_IP:5000/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const result = await response.json();

    if (!response.ok) {
      await redis.set(`status:${fileUrl}`, JSON.stringify({
        status: "Conversion failed",
        stage: "error",
        timestamp: new Date().toISOString()
      }));
      return res.status(500).json({ error: result.error || "Conversion failed" });
    }

    // Step 3: Simulated URLs (replace with real Blob upload URLs later)
    const dstUrl = result.dst ? `${fileUrl}.dst.mock` : null;
    const pesUrl = result.pes ? `${fileUrl}.pes.mock` : null;

    // Step 4: Save preview URLs to Redis
    await redis.set(`preview:${fileUrl}`, JSON.stringify({
      dstUrl,
      pesUrl,
      timestamp: new Date().toISOString(),
    }));

    // Step 5: Update status to "done"
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Conversion complete",
      stage: "done",
      timestamp: new Date().toISOString()
    }));

    // Step 6: Return preview and converted data
    return res.status(200).json({
      convertedDst: dstUrl,
      convertedPes: pesUrl,
      convertedUrl: fileUrl,
    });
  } catch (err) {
    console.error("Conversion failed:", err);
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Internal error",
      stage: "error",
      timestamp: new Date().toISOString()
    }));
    return res.status(500).json({ error: "Internal server error" });
  }
}