import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, rating, review } = req.body;

  if (!fileUrl || !rating || !review) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  await kv.lpush(`reviews:${fileUrl}`, JSON.stringify({
    user: session.user.username,
    rating,
    review,
    timestamp: new Date().toISOString(),
  }));

  return res.status(200).json({ message: "Review added successfully" });
};