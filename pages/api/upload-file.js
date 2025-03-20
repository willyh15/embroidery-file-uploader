import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client with the correct environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,     // Updated environment variable name
  token: process.env.KV_REST_API_TOKEN, // Updated token reference
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  const version = Date.now();

  try {
    // Use Upstash Redis LPUSH command to store version history for the file
    await redis.lpush(`versions:${fileUrl}`, JSON.stringify({ version, fileUrl }));

    return res.status(200).json({ message: `Version ${version} saved for file`, version });
  } catch (error) {
    console.error("Error saving file version:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}