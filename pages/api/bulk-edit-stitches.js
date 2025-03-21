import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Initialize Upstash Redis client with updated environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, edits } = req.body;
  if (!fileUrl || !edits || edits.length === 0) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  try {
    await redis.set(`bulk-edit:${fileUrl}`, JSON.stringify(edits));
    return res.status(200).json({ message: "Bulk edit applied successfully" });
  } catch (error) {
    console.error("Error applying bulk edit:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}