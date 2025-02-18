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

  const logEntry = {
    username: session.user.username,
    action: "viewed",
    fileUrl,
    timestamp: new Date().toISOString(),
  };

  await kv.lpush(`file-access:${fileUrl}`, JSON.stringify(logEntry));

  return res.status(200).json({ message: "Access logged" });
}