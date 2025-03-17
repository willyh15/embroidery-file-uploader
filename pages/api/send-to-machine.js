import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// 1. Create your Upstash Redis client using env variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,      // from Upstash console
  token: process.env.KV_REST_API_TOKEN,  // from Upstash console
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, machineId } = req.body;

  if (!fileUrl || !machineId) {
    return res.status(400).json({ error: "File URL and Machine ID are required" });
  }

  // 2. Replace `kv.lpush(...)` with `redis.lpush(...)`
  await redis.lpush(`machine-uploads:${machineId}`, fileUrl);

  return res.status(200).json({ message: "File sent to embroidery machine" });
}