// pages/api/optimize-stitch.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl, format } = req.body;
  if (!fileUrl || !format) {
    return res.status(400).json({ error: "fileUrl and format are required" });
  }

  try {
    const flaskResponse = await fetch("https://23.94.202.56:5000/optimize-stitch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl, format }),
    });

    if (!flaskResponse.ok) {
      const errData = await flaskResponse.json().catch(() => null);
      throw new Error(errData?.error || "Flask optimize-stitch error");
    }

    const data = await flaskResponse.json();
    return res.status(200).json({
      optimizedFile: data.optimized_file,
      stitchType: data.stitch_type,
    });
  } catch (error) {
    console.error("Error optimizing stitch:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}