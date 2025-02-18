export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fabricType, edgeCount } = req.body;

  if (!fabricType || edgeCount === undefined) {
    return res.status(400).json({ error: "Fabric type and edge count are required" });
  }

  const response = await fetch("https://your-render-api.com/recommend-stitch-density", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fabricType, edgeCount }),
  });

  const data = await response.json();
  return res.status(200).json({ recommendedDensity: data.recommended_density });
};