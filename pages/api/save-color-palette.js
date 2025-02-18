import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { paletteName, colors } = req.body;

  if (!paletteName || !colors || colors.length === 0) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  await kv.hset(`color-palette:${session.user.username}`, { [paletteName]: JSON.stringify(colors) });

  return res.status(200).json({ message: "Palette saved successfully" });
};