import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Create your Upstash Redis client once with environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl, price } = req.body;

  if (!fileUrl || price === undefined) {
    return res.status(400).json({ error: "File URL and price are required" });
  }

  // Store the design details under the hash key "design:<fileUrl>"
  // with the fields "uploader" and "price"
  await redis.hset(`design:${fileUrl}`, {
    uploader: session.user.username,
    price,
  });

  return res.status(200).json({ message: "Design uploaded to marketplace" });
}