import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, adjustments } = req.body;

  if (!fileUrl || !adjustments || adjustments.length === 0) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  await kv.set(`bulk-adjustments:${fileUrl}`, JSON.stringify(adjustments));

  return res.status(200).json({ message: "Bulk adjustments applied successfully" });
};