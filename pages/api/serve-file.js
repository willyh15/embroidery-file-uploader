// /pages/api/serve-file.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing fileUrl" });
  }

  const session = await getServerSession(req, res, authOptions);
  const visibilityKey = `visibility:${fileUrl}`;

  try {
    const visibility = await redis.get(visibilityKey);

    if (visibility === "public") {
      return res.redirect(fileUrl);
    }

    // If not public, require auth
    if (!session) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const username = session?.user?.email || session?.user?.name;
    const uploaderKey = `owner:${fileUrl}`;
    const owner = await redis.get(uploaderKey);

    if (owner === username) {
      return res.redirect(fileUrl);
    }

    return res.status(403).json({ error: "Access denied" });
  } catch (err) {
    console.error("Access check failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}