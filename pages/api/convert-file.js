import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { fileUrl } = req.body;

    if (!fileUrl || typeof fileUrl !== "string") {
      return res.status(400).json({ error: "Missing or invalid fileUrl" });
    }

    const flaskUrl = `${process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org"}/convert`;

    console.log("➡️ Sending to Flask:", flaskUrl, "with fileUrl:", fileUrl);

    const flaskResponse = await fetch(flaskUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const text = await flaskResponse.text();
    console.log("⬅️ Flask raw response:", text);

    if (!text.trim()) {
      return res.status(502).json({
        error: "Flask server returned empty response",
        raw: text,
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      console.error("❌ JSON parse error from Flask:", jsonErr);
      return res.status(500).json({
        error: "Invalid JSON from Flask",
        raw: text,
      });
    }

    if (!flaskResponse.ok) {
      console.error("❌ Flask response not OK:", data);
      throw new Error(data.error || "Flask conversion failed");
    }

    if (!data.task_id) {
      return res.status(500).json({ error: "Flask did not return a task_id", raw: data });
    }

    return res.status(202).json({ taskId: data.task_id });
  } catch (err) {
    console.error("❌ Convert API Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
