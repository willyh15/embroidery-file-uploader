import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, position } = req.body;

  if (!fileUrl || !position) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  await kv.set(`design-position:${fileUrl}`, JSON.stringify(position));

  return res.status(200).json({ message: "Position saved" });
};