import { Redis } from "@upstash/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
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
  } catch (err) {
    console.error("Error creating role:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}