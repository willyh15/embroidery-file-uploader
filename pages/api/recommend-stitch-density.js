export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { fabricType, edgeCount } = req.body;

    if (!fabricType || edgeCount === undefined) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Ensure edgeCount is a number
    const numericEdgeCount = Number(edgeCount);
    if (isNaN(numericEdgeCount)) {
      return res.status(400).json({ error: "edgeCount must be a number" });
    }

    // Dummy logic to calculate recommended stitch density
    const recommendedDensity =
      numericEdgeCount > 1000 ? "High Density" : "Medium Density";

    return res.status(200).json({ recommendedDensity });
  } catch (error) {
    console.error("Error calculating stitch density:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
