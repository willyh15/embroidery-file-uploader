export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl, edits } = req.body;
  
  if (!fileUrl || !edits) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const response = await fetch("https://your-render-api.com/edit-stitch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, edits }),
  });

  const data = await response.json();
  return res.status(200).json({ editedFile: data.edited_file });
};