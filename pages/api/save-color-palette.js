import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// 1. Create your Upstash Redis client using environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,      // from your Upstash dashboard
  token: process.env.KV_REST_API_TOKEN,  // from your Upstash dashboard
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { paletteName, colors } = req.body;

  if (!paletteName || !colors || colors.length === 0) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  // 2. Store the palette under the key "color-palette:{username}"
  // mapping the provided paletteName to a JSON string of colors
  await redis.hset(`color-palette:${session.user.username}`, {
    [paletteName]: JSON.stringify(colors),
  });

  return res.status(200).json({ message: "Palette saved successfully" });
}
