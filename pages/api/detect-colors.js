export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  try {
    // You can replace the hardcoded URL with an environment variable if desired:
    const apiUrl = process.env.DETECT_COLORS_API_URL || "https://your-render-api.com/detect-colors";
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to detect colors");
    }

    const data = await response.json();
    return res.status(200).json({ threadColors: data.thread_colors });
  } catch (error) {
    console.error("Error detecting colors:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}