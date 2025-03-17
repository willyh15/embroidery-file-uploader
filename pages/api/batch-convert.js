export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrls, format } = req.body;

  if (!fileUrls || fileUrls.length === 0 || !format) {
    return res.status(400).json({ error: "File URLs and format are required" });
  }

  const batchConvertUrl = process.env.BATCH_CONVERT_URL; // e.g., "https://your-render-api.com/batch-convert"
  if (!batchConvertUrl) {
    return res.status(500).json({ error: "Batch convert API URL not configured" });
  }

  try {
    const response = await fetch(batchConvertUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrls, format }),
    });

    if (!response.ok) {
      throw new Error("Batch conversion failed");
    }

    const data = await response.json();
    return res.status(200).json({ convertedFiles: data.converted_files });
  } catch (error) {
    console.error("Error during batch conversion:", error);
    return res.status(500).json({ error: "Failed to process batch conversion" });
  }
}