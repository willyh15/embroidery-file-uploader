export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  try {
    const response = await fetch("https://your-render-api.com/stitch-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch stitch preview");
    }

    const data = await response.json();
    return res.status(200).json({ previewFile: data.preview_file });
  } catch (error) {
    console.error("Error in stitch-preview handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}