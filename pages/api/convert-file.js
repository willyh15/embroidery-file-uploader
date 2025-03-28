// /pages/api/convert-file.js
import { Redis } from "@upstash/redis";
import { put } from "@vercel/blob";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const CONVERT_ENDPOINT = (
  process.env.CONVERT_URL || "http://23.94.202.56:5000"
) + "/convert";

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
      status: "Starting conversion",
      stage: "converting",
      timestamp: new Date().toISOString()
    }));

    console.log("Sending to Flask:", CONVERT_ENDPOINT, { fileUrl });

    const response = await fetch(CONVERT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    // More robust JSON parsing with debug logging
    let result;
    let responseText = await response.text();
    try {
      result = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse JSON from Flask response:", parseErr, "Raw response:", responseText);
      await redis.set(`status:${fileUrl}`, JSON.stringify({
        status: "Invalid JSON response",
        stage: "error",
        timestamp: new Date().toISOString()
      }));
      return res.status(500).json({ error: "Invalid JSON from Flask", details: responseText });
    }

    console.log("Flask conversion response:", {
      status: response.status,
      ok: response.ok,
      result
    });

    if (!response.ok || (!result.dst && !result.pes)) {
      console.error("Flask conversion error details:", result);
      await redis.set(`status:${fileUrl}`, JSON.stringify({
        status: "Conversion failed",
        stage: "error",
        timestamp: new Date().toISOString()
      }));
      return res.status(500).json({ error: result.error || "Conversion failed" });
    }

    let uploadedDstUrl = null;
    let uploadedPesUrl = null;

    if (result.dst) {
      const dstBuffer = Buffer.from(result.dst, "hex");
      const dstBlob = await put(`converted/${Date.now()}.dst`, dstBuffer, {
        access: "public",
        token: BLOB_TOKEN,
      });
      uploadedDstUrl = dstBlob.url;
    }

    if (result.pes) {
      const pesBuffer = Buffer.from(result.pes, "hex");
      const pesBlob = await put(`converted/${Date.now()}.pes`, pesBuffer, {
        access: "public",
        token: BLOB_TOKEN,
      });
      uploadedPesUrl = pesBlob.url;
    }

    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Conversion complete",
      stage: "done",
      timestamp: new Date().toISOString()
    }));

    await redis.set(`preview:${fileUrl}`, JSON.stringify({
      dstUrl: uploadedDstUrl,
      pesUrl: uploadedPesUrl,
      timestamp: new Date().toISOString()
    }));

    return res.status(200).json({
      convertedDst: uploadedDstUrl,
      convertedPes: uploadedPesUrl,
      convertedUrl: fileUrl
    });

  } catch (err) {
    console.error("Conversion error:", err);
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Internal error",
      stage: "error",
      timestamp: new Date().toISOString()
    }));
    return res.status(500).json({ error: "Internal server error" });
  }
}