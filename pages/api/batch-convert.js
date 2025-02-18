export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrls, format } = req.body;

  if (!fileUrls || fileUrls.length === 0 || !format) {
    return res.status(400).json({ error: "File URLs and format are required" });
  }

  const response = await fetch("https://your-render-api.com/batch-convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrls, format }),
  });

  const data = await response.json();
  return res.status(200).json({ convertedFiles: data.converted_files });
};