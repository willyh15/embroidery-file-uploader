import speakeasy from "speakeasy";
import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Initialize Upstash Redis client with updated environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const secret = speakeasy.generateSecret();

  // Store the base32 version of the secret in Redis
  await redis.set(`2fa:${session.user.username}`, secret.base32);

  return res.status(200).json({ secret: secret.otpauth_url });
}