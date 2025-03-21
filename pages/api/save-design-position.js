import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client using updated environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,     // Use consistent naming convention
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, position } = req.body;
  if (!fileUrl || typeof position !== "object") {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    await redis.set(`design-position:${fileUrl}`, JSON.stringify(position));
    return res.status(200).json({ message: "Position saved successfully" });
  } catch (error) {
    console.error("Error saving design position:", error);
    return res.status(500).json({ error: "Failed to save position" });
  }
}