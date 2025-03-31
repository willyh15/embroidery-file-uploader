import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const CONVERT_ENDPOINT = process.env.CONVERT_URL || "http://23.94.202.56:5000/convert";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });  // Ensure we only accept POST requests
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

    // Log the conversion job being sent to Flask
    console.log(`Sending conversion job for file: ${fileUrl} to Flask backend at ${CONVERT_ENDPOINT}`);
    
    const response = await fetch(CONVERT_ENDPOINT, {
      method: "POST",  // Make sure this is a POST request to your Flask server
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    // Check if Flask responded
    if (!response.ok) {
      const errorMsg = `Flask server returned an error: ${response.statusText}`;
      console.error(errorMsg);
      await redis.set(`status:${fileUrl}`, JSON.stringify({
        status: "Flask request failed",
        stage: "error",
        timestamp: new Date().toISOString(),
      }));
      return res.status(500).json({ error: errorMsg });
    }

    const responseData = await response.json();
    console.log("Flask conversion response:", responseData);

    return res.status(200).json({ message: "Conversion job submitted." });
  } catch (err) {
    console.error("Vercel conversion trigger error:", err);
    await redis.set(`status:${fileUrl}`, JSON.stringify({
      status: "Trigger error",
      stage: "error",
      timestamp: new Date().toISOString(),
    }));
    return res.status(500).json({ error: "Failed to submit conversion job." });
  }
}