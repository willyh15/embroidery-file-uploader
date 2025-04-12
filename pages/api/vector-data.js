// pages/api/vector-data.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "Missing fileUrl" });
  }

  try {
    const backendUrl = process.env.FLASK_BASE_URL || "https://embroideryfiles.duckdns.org";
    const response = await fetch(`${backendUrl}/vector-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch vector data");
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("/api/vector-data.js error:", error);
    return res.status(500).json({ error: "Failed to load vector data" });
  }
}
