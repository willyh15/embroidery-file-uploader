import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, price } = req.body;

  if (!fileUrl || price === undefined) {
    return res.status(400).json({ error: "File URL and price are required" });
  }

  await kv.hset(`design:${fileUrl}`, { uploader: session.user.username, price });

  return res.status(200).json({ message: "Design uploaded to marketplace" });
};