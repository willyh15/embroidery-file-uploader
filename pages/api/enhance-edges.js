export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  // Use the environment variable for the edge enhancement API URL
  const EDGE_ENHANCE_API_URL = process.env.EDGE_ENHANCE_API_URL;
  if (!EDGE_ENHANCE_API_URL) {
    return res.status(500).json({ error: "Edge enhancement API URL is not configured" });
  }

  try {
    const response = await fetch(EDGE_ENHANCE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Edge enhancement failed" });
    }

    const data = await response.json();
    return res.status(200).json({ enhancedFile: data.enhanced_file });
  } catch (error) {
    console.error("Error calling edge enhancement API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}