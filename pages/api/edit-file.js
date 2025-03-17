// pages/api/edit-file.js (for example)
import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Instantiate your Upstash Redis client with your environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,    // rename or keep as you prefer
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, newContent } = req.body;

  if (!fileUrl || !newContent) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Replace kv.set(...) with redis.set(...)
  // This stores the entire file content as a single Redis string
  await redis.set(`file-content:${fileUrl}`, newContent);

  return res.status(200).json({ message: "File updated successfully" });
}