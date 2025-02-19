export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { hoopSize } = req.body;

  if (!hoopSize) {
    return res.status(400).json({ error: "Hoop size is required" });
  }

  const response = await fetch("https://your-render-api.com/generate-hoop-guides", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hoopSize }),
  });

  const data = await response.json();
  return res.status(200).json({ guideFile: data.guide_file });
};