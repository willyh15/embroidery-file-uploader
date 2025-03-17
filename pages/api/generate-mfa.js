import speakeasy from "speakeasy";
import { Redis } from "@upstash/redis";

// 1. Instantiate your Redis client using Upstash credentials from your environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,      // from Upstash console
  token: process.env.KV_REST_API_TOKEN,  // from Upstash console
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  const secret = speakeasy.generateSecret({ length: 20 });
  
  // 2. Replace "kv.set(...)" with your Upstash Redis method, for example redis.set(...)
  await redis.set(`mfa:${username}`, secret.base32);

  return res.status(200).json({ secret: secret.base32 });
}