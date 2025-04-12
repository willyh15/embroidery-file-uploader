// pages/api/save-vector.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fileUrl, svg } = req.body;

  if (!fileUrl || !svg) {
    return res.status(400).json({ error: "Missing fileUrl or svg content" });
  }

  try {
    const response = await fetch("https://embroideryfiles.duckdns.org/save-svg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fileUrl, svg })
    });

    if (!response.ok) {
      throw new Error("Failed to save SVG on backend");
    }

    const data = await response.json();
    return res.status(200).json({ message: "Saved", ...data });
  } catch (error) {
    console.error("Error saving vector:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
