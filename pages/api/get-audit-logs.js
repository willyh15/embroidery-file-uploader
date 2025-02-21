import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const logs = await kv.lrange(`audit:${session.user.username}`, 0, -1);

  return res.status(200).json({ logs });
}
