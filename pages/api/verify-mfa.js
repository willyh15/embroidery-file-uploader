import speakeasy from "speakeasy";
import { Redis } from "@upstash/redis";

// Instantiate the Upstash Redis client using your new environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,   // e.g. "https://usw1-xxxx.upstash.io"
  token: process.env.UPSTASH_REDIS_REST_TOKEN, // e.g. "your_token_here"
});

export default async function handler(req, res) {
  const { username, token } = req.body;

  if (!username || !token) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Use the Upstash Redis client to get the secret
  const secret = await redis.get(`mfa:${username}`);
  if (!secret) {
    return res.status(404).json({ error: "No MFA setup for this user" });
  }

  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
  });

  if (!verified) {
    return res.status(403).json({ error: "Invalid MFA code" });
  }

  return res.status(200).json({ message: "MFA verified" });
}