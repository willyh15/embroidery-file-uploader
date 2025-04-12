// pages/api/vector-data.js

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing fileUrl" });
  }

  try {
    const svgUrl = fileUrl.replace(/\.(png|jpg|jpeg|webp)$/, ".svg");
    const response = await fetch(svgUrl);
    if (!response.ok) throw new Error("Failed to fetch SVG");

    const svgText = await response.text();
    res.status(200).json({ svg: svgText });
  } catch (error) {
    console.error("Error loading vector data:", error);
    res.status(500).json({ error: "Failed to load vector data" });
  }
}
