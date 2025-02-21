export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  const reviews = await kv.lrange(`reviews:${fileUrl}`, 0, -1);

  return res.status(200).json({ reviews: reviews.map((r) => JSON.parse(r)) });
};