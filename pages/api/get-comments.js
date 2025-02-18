export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  const comments = await kv.lrange(`comments:${fileUrl}`, 0, -1);
  
  return res.status(200).json({ comments: comments.map((c) => JSON.parse(c)) });
}