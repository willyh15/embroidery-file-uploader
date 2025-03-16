export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { hoopSize } = req.body;

  if (!hoopSize) {
    return res.status(400).json({ error: "Hoop size is required" });
  }

  // Dummy URL for now; replace this with actual logic
  const alignmentGuideUrl = `https://example.com/guides/${hoopSize.width}x${hoopSize.height}.png`;

  return res.status(200).json({ alignmentGuideUrl });
}