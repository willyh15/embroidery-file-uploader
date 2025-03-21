import { getSession } from "next-auth/react";
import { Redis } from "@upstash/redis";

// Initialize Redis client with updated environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const subscriptionData = await redis.get(`subscription:${session.user.email}`);
    const subscription = subscriptionData ? JSON.parse(subscriptionData) : null;
    const isPremium = subscription?.active || false;

    return res.status(200).json({ isPremium });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}