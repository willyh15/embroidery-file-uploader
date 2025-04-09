// /pages/api/convert-file.js
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
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Queued",
      stage: "submitted",
      timestamp: new Date().toISOString(),
    }));

    const flaskRes = await fetch(CONVERT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const raw = await flaskRes.text();

    if (!flaskRes.ok) {
      await redis.set(`status:${fileUrl}`, JSON.stringify({
        status: "Flask error",
        stage: "error",
        timestamp: new Date().toISOString(),
      }));
      return res.status(500).json({ error: "Flask backend failed", details: raw });
    }

    let result;
    try {
      result = JSON.parse(raw);
    } catch (err) {
      return res.status(500).json({ error: "Invalid JSON from Flask" });
    }

    const { pesUrl, dstUrl } = result;

    if (!pesUrl) {
      await redis.set(`status:${fileUrl}`, JSON.stringify({
        status: "No output",
        stage: "error",
        timestamp: new Date().toISOString(),
      }));
      return res.status(500).json({ error: "No PES output received" });
    }

    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Converted",
      stage: "done",
      timestamp: new Date().toISOString(),
      pesUrl,
      dstUrl,
    }));

    return res.status(200).json({ pesUrl, dstUrl });
  } catch (err) {
    console.error("Convert API Error:", err);
    return res.status(500).json({ error: "Conversion failed", details: err.message });
  }
}