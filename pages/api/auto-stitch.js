export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  // Use an environment variable for the auto-stitch API endpoint.
  const autoStitchUrl = process.env.AUTO_STITCH_URL; // e.g. "https://your-render-api.com/auto-stitch"
  if (!autoStitchUrl) {
    return res.status(500).json({ error: "Auto stitch API URL not configured" });
  }

  try {
    const response = await fetch(autoStitchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await response.json();

    return res.status(200).json({ autoStitchedFile: data.auto_stitched_file });
  } catch (error) {
    console.error("Error calling auto stitch API:", error);
    return res.status(500).json({ error: "Failed to process auto stitch" });
  }
}