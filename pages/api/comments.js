import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!(await rateLimit(ip, 5, 60))) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  if (req.method === "POST") {
    const { fileUrl, comment } = req.body;
    if (!fileUrl || !comment) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    
    await kv.append(`comments:${fileUrl}`, comment);
    return res.status(200).json({ message: "Comment added successfully" });
  }

  if (req.method === "GET") {
    const { fileUrl } = req.query;
    const comments = await kv.get(`comments:${fileUrl}`) || [];
    return res.status(200).json({ comments });
  }

  res.status(405).json({ error: "Method not allowed" });
}