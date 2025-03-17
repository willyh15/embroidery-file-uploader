// pages/api/assign-role.js
import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Instantiate the Upstash Redis client using your environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  // Only allow admins to assign roles
  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { username, roleName } = req.body;

  if (!username || !roleName) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Set the role field in a Redis hash for the specified user
  await redis.hset(`user:${username}`, { role: roleName });

  return res.status(200).json({ message: `Role assigned to ${username}` });
}