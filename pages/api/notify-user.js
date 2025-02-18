import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { recipient, message } = req.body;

  if (!recipient || !message) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  await kv.lpush(`notifications:${recipient}`, JSON.stringify({ message, timestamp: new Date().toISOString() }));

  return res.status(200).json({ message: "Notification sent" });
}