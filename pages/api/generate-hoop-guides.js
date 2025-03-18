export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { hoopSize } = req.body;

  if (!hoopSize) {
    return res.status(400).json({ error: "Hoop size is required" });
  }

  // Use an environment variable for the external API URL
  const renderApiUrl = process.env.RENDER_API_URL || "https://your-render-api.com";

  const response = await fetch(`${renderApiUrl}/generate-hoop-guides`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hoopSize }),
  });

  const data = await response.json();
  return res.status(200).json({ guideFile: data.guide_file });
}