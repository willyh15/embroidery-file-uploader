export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  try {
    const response = await fetch("https://your-render-api.com/sync-design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: errorData.error || "Failed to sync design",
      });
    }

    const data = await response.json();
    return res.status(200).json({ cloudUrl: data.cloud_url });
  } catch (error) {
    console.error("Error syncing design:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}