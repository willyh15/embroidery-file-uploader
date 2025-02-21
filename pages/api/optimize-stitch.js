export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl, format } = req.body;

  if (!fileUrl || !format) {
    return res.status(400).json({ error: "File URL and format are required" });
  }

  const response = await fetch("https://your-render-api.com/optimize-stitch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, format }),
  });

  const data = await response.json();
  return res.status(200).json({ optimizedFile: data.optimized_file, stitchType: data.stitch_type });
};