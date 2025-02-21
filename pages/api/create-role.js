import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { roleName, storageLimit } = req.body;

  if (!roleName || !storageLimit) {
    return res.status(400).json({ error: "Missing role parameters" });
  }

  await kv.hset(`roles:${roleName}`, { storageLimit });

  return res.status(200).json({ message: `Role ${roleName} created successfully` });
}
