export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  const response = await fetch("https://your-render-api.com/auto-stitch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl }),
  });

  const data = await response.json();
  return res.status(200).json({ autoStitchedFile: data.auto_stitched_file });
};