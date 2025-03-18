export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  try {
    const response = await fetch("https://your-render-api.com/optimize-stitch-path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
      throw new Error("External API call failed");
    }

    const data = await response.json();
    return res.status(200).json({ optimizedFile: data.optimized_file });
  } catch (error) {
    console.error("Error optimizing stitch path:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
