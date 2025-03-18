import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Instantiate your Upstash Redis client using environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,      // from your Upstash Dashboard
  token: process.env.KV_REST_API_TOKEN,  // from your Upstash Dashboard
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "File URL is required" });
  }

  const logEntry = {
    username: session.user.username,
    action: "viewed",
    fileUrl,
    timestamp: new Date().toISOString(),
  };

  // Use the Upstash Redis client's lpush method to store the log entry
  await redis.lpush(`file-access:${fileUrl}`, JSON.stringify(logEntry));

  return res.status(200).json({ message: "Access logged" });
}