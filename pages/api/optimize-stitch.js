export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl, format } = req.body;

  if (!fileUrl || !format) {
    return res.status(400).json({ error: "File URL and format are required" });
  }

  try {
    const response = await fetch("https://your-render-api.com/optimize-stitch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl, format }),
    });

    if (!response.ok) {
      throw new Error("External API error");
    }

    const data = await response.json();
    return res.status(200).json({
      optimizedFile: data.optimized_file,
      stitchType: data.stitch_type,
    });
  } catch (error) {
    console.error("Error optimizing stitch:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
