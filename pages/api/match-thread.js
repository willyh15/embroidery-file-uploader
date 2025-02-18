export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { rgb } = req.body;
  
  if (!rgb) {
    return res.status(400).json({ error: "RGB values required" });
  }

  const response = await fetch("https://your-render-api.com/match-thread", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rgb }),
  });

  const data = await response.json();
  return res.status(200).json({ matchedThreadBrand: data.matched_thread_brand });
};