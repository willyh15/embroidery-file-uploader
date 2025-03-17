import speakeasy from "speakeasy";
import { Redis } from "@upstash/redis";
import { getSession } from "next-auth/react";

// Initialize Upstash Redis client using environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const secret = speakeasy.generateSecret();
  await redis.set(`2fa:${session.user.username}`, secret.base32);

  return res.status(200).json({ secret: secret.otpauth_url });
}