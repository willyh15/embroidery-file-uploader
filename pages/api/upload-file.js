import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  const version = Date.now();
  await kv.lpush(`versions:${fileUrl}`, JSON.stringify({ version, fileUrl }));

  return res.status(200).json({ message: "File version saved", version });
};