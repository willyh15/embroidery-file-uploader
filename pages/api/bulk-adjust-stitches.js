import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Initialize your Upstash Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,     // e.g. "https://usw1-xxxx-12345.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN  // e.g. "************"
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, adjustments } = req.body;

  if (!fileUrl || !adjustments || adjustments.length === 0) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  // Convert the adjustments array to JSON and store it under the key "bulk-adjustments:<fileUrl>"
  await redis.set(`bulk-adjustments:${fileUrl}`, JSON.stringify(adjustments));

  return res.status(200).json({ message: "Bulk adjustments applied successfully" });
};