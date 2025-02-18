import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, edits } = req.body;

  if (!fileUrl || !edits || edits.length === 0) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  await kv.set(`bulk-edit:${fileUrl}`, JSON.stringify(edits));

  return res.status(200).json({ message: "Bulk edit applied successfully" });
};