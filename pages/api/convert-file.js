// pages/api/convert-file.js
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { fileUrl } = req.body;
    if (!fileUrl || typeof fileUrl !== "string") {
      return res.status(400).json({ error: "Missing or invalid fileUrl" });
    }

    const flaskUrl = `${process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org"}/convert`;

    const flaskResponse = await fetch(flaskUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const text = await flaskResponse.text();
    if (!text.trim()) return res.status(502).json({ error: "Empty response from Flask" });

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({ error: "Invalid JSON from Flask", raw: text });
    }

    if (!flaskResponse.ok || !data.task_id) {
      return res.status(500).json({ error: "Flask conversion failed", raw: data });
    }

    return res.status(202).json({ taskId: data.task_id });
  } catch (err) {
    console.error("Convert API Error:", err);
    return res.status(500).json({ error: err.message });
  }
}