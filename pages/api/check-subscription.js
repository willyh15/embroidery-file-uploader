import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const subscription = await kv.get(`subscription:${session.user.email}`);

  return res.status(200).json({ isPremium: subscription?.active || false });
};