import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";
import { rateLimit } from "../../utils/rate-limit";


export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, comment } = req.body;

  if (!fileUrl || !comment.trim()) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  const commentEntry = {
    username: session.user.username,
    comment,
    timestamp: new Date().toISOString(),
  };

  await kv.lpush(`comments:${fileUrl}`, JSON.stringify(commentEntry));

  return res.status(200).json({ message: "Comment added successfully" });
}
export default async function handler(req, res) {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (!(await rateLimit(ip, 5, 60))) {
    return res.status(429).json({ error: "Too many requests, try again later." });
  }

  // Proceed with existing comment logic...
}