// pages/api/auto-stitch.js
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
    // Mark in Redis that we started auto-stitch
    await redis.set(
      `status:${fileUrl}`,
      JSON.stringify({
        status: "Starting auto-stitch",
        stage: "auto-stitching",
        timestamp: new Date().toISOString(),
      })
    );

    // Forward to your Flask server's new /auto-stitch route
    const flaskResponse = await fetch("http://23.94.202.56:5000/auto-stitch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await flaskResponse.json();
    if (!flaskResponse.ok) {
      // Mark in Redis that auto-stitch failed
      await redis.set(
        `status:${fileUrl}`,
        JSON.stringify({
          status: "Auto-stitch failed",
          stage: "error",
          timestamp: new Date().toISOString(),
        })
      );
      return res.status(500).json({ error: data.error || "Auto-stitch failed" });
    }

    // Mark in Redis that auto-stitch completed
    await redis.set(
      `status:${fileUrl}`,
      JSON.stringify({
        status: "Auto-stitch complete",
        stage: "done",
        timestamp: new Date().toISOString(),
      })
    );

    return res.status(200).json({ autoStitchedFile: data.auto_stitched_file });
  } catch (error) {
    console.error("Auto-stitch error:", error);
    await redis.set(
      `status:${fileUrl}`,
      JSON.stringify({
        status: "Internal error (auto-stitch)",
        stage: "error",
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(500).json({ error: "Failed to process auto-stitch" });
  }
}