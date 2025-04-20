// pages/api/progress.js
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { taskId } = req.query;

  if (!taskId || typeof taskId !== "string") {
    return res.status(400).json({ error: "Missing or invalid taskId" });
  }

  try {
    const flaskUrl = `${process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org"}/status/${taskId}`;

    const flaskResponse = await fetch(flaskUrl);
    const text = await flaskResponse.text();

    if (!text.trim()) return res.status(502).json({ error: "Empty response from Flask" });

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({ error: "Invalid JSON from Flask", raw: text });
    }

    if (!flaskResponse.ok) {
      return res.status(500).json({ error: "Failed to fetch progress from Flask", raw: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("[Progress API Error]", err);
    return res.status(500).json({ error: err.message });
  }
}