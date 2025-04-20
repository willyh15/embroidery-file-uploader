import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { taskId, fileUrl } = req.query;

  if (!taskId || !fileUrl) {
    return res.status(400).json({ error: "Missing taskId or fileUrl" });
  }

  try {
    const flaskUrl = `${process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org"}/status/${taskId}`;

    const flaskResponse = await fetch(flaskUrl);

    if (!flaskResponse.ok) {
      const text = await flaskResponse.text();
      console.error("[Progress] Flask status error:", text);
      return res.status(502).json({ error: "Failed to fetch status from Flask", raw: text });
    }

    const data = await flaskResponse.json();

    // Standardize return format for frontend
    return res.status(200).json({
      taskId,
      fileUrl,
      state: data.state || "unknown",
      status: data.status || "",
      stage: data.stage || "",
      pesUrl: data.pesUrl || "",
    });
  } catch (err) {
    console.error("[Progress] API error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}