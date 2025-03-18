import speakeasy from "speakeasy";
import { Redis } from "@upstash/redis";

// Instantiate your Redis client using Upstash credentials from your environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,      // from your Upstash console
  token: process.env.KV_REST_API_TOKEN,  // from your Upstash console
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  // Generate a new secret (20-character base32 string)
  const secret = speakeasy.generateSecret({ length: 20 });
  
  // Store the secret in Upstash Redis under the key "mfa:<username>"
  await redis.set(`mfa:${username}`, secret.base32);

  return res.status(200).json({ secret: secret.base32 });
}