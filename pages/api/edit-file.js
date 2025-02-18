import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, newContent } = req.body;

  if (!fileUrl || !newContent) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  await kv.set(`file-content:${fileUrl}`, newContent);

  return res.status(200).json({ message: "File updated successfully" });
}