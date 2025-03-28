// pages/api/stitch-preview.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  try {
    // Forward to Flask
    const flaskResponse = await fetch("http://23.94.202.56:5000/stitch-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    if (!flaskResponse.ok) {
      const errData = await flaskResponse.json().catch(() => null);
      throw new Error(errData?.error || "Flask preview error");
    }

    const data = await flaskResponse.json();
    return res.status(200).json({ previewFile: data.preview_file });
  } catch (error) {
    console.error("Error in stitch-preview handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}