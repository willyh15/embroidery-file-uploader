// pages/api/rollback-files.js
import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

/**
 * 1. Instantiate Upstash Redis client using your Upstash environment vars.
 *    Make sure you defined KV_REST_API_URL and KV_REST_API_TOKEN in
 *    your environment variables on Vercel.
 */
const redis = new Redis({
  url: process.env.KV_REST_API_URL,      // from your Upstash Dashboard
  token: process.env.KV_REST_API_TOKEN,  // from your Upstash Dashboard
});

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileNames } = req.body;
  if (!fileNames || fileNames.length === 0) {
    return res.status(400).json({ error: "No files provided" });
  }

  const rollbackFiles = [];

  // 2. Replace "kv.lrange(...)" with "redis.lrange(...)"
  //    and "kv.ltrim(...)" with "redis.ltrim(...)"
  for (const fileName of fileNames) {
    const versions = await redis.lrange(`versions:${fileName}`, 0, -1);
    if (versions.length < 2) continue; // Skip if no previous versions

    const previousVersion = JSON.parse(versions[1]); // second-latest version
    rollbackFiles.push({ fileName, url: previousVersion.url });

    // Remove only the latest version from the list, keeping the previous
    await redis.ltrim(`versions:${fileName}`, 1, -1);
  }

  return res.status(200).json({ rollbackFiles });
}