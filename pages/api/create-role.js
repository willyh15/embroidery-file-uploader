import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// Initialize your Upstash Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,     // e.g. "https://xxxx.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN  // e.g. "your_token_here"
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  // Only allow admin users to assign roles
  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { roleName, storageLimit } = req.body;

  if (!roleName || !storageLimit) {
    return res.status(400).json({ error: "Missing role parameters" });
  }

  try {
    // Use Upstash Redis hset to store the role configuration
    await redis.hset(`roles:${roleName}`, { storageLimit });
    return res.status(200).json({ message: `Role ${roleName} created successfully` });
  } catch (error) {
    console.error("Error creating role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}