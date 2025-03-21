import { Redis } from "@upstash/redis";
import speakeasy from "speakeasy";

// Initialize Upstash Redis client using your unified env vars
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { username, token } = req.body;

  if (!username || !token) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const secret = await redis.get(`2fa:${username}`);
    if (!secret) {
      return res.status(404).json({ error: "No 2FA setup for this user" });
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return res.status(403).json({ error: "Invalid 2FA code" });
    }

    return res.status(200).json({ message: "2FA verified" });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}