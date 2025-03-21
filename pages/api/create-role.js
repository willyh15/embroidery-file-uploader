import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client with your unified env vars
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
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
    await redis.hset(`roles:${roleName}`, { storageLimit });
    return res.status(200).json({ message: `Role "${roleName}" created successfully` });
  } catch (error) {
    console.error("Error creating role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}