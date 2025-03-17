import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

/**
 * Instantiate Upstash Redis client using your Upstash environment variables.
 * Make sure you defined KV_REST_API_URL and KV_REST_API_TOKEN in your Vercel environment.
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

  // For each file, retrieve its version history using redis.lrange,
  // then if there is a previous version, add it to the rollbackFiles array
  // and trim the latest version from the list.
  for (const fileName of fileNames) {
    const versions = await redis.lrange(`versions:${fileName}`, 0, -1);
    if (versions.length < 2) continue; // Skip if no previous versions

    const previousVersion = JSON.parse(versions[1]); // second-latest version
    rollbackFiles.push({ fileName, url: previousVersion.url });

    // Remove only the latest version, keeping the previous versions intact.
    await redis.ltrim(`versions:${fileName}`, 1, -1);
  }

  return res.status(200).json({ rollbackFiles });
}