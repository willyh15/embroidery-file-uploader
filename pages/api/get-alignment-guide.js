export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { hoopSize } = req.body;

  if (!hoopSize) {
    return res.status(400).json({ error: "Hoop size is required" });
  }

  try {
    // Call your external API that generates the alignment guide
    const response = await fetch("https://your-render-api.com/generate-hoop-guides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hoopSize }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate hoop guides");
    }

    const data = await response.json();
    // Assume your external API returns an object with a "guideFile" property
    return res.status(200).json({ alignmentGuideUrl: data.guideFile });
  } catch (error) {
    console.error("Error generating hoop guides:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}