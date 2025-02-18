import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, visibility } = req.body;

  if (!fileUrl || !["public", "private"].includes(visibility)) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  await kv.hset(`file:${fileUrl}`, { visibility });

  return res.status(200).json({ message: "File visibility updated" });
}