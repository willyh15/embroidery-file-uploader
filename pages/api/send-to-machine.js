import { getSession } from "next-auth/react";
import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, machineId } = req.body;

  if (!fileUrl || !machineId) {
    return res.status(400).json({ error: "File URL and Machine ID are required" });
  }

  await kv.lpush(`machine-uploads:${machineId}`, fileUrl);

  return res.status(200).json({ message: "File sent to embroidery machine" });
};