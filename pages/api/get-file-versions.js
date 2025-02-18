export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  const versions = await kv.lrange(`versions:${fileUrl}`, 0, -1);

  return res.status(200).json({ versions: versions.map((v) => JSON.parse(v)) });
};