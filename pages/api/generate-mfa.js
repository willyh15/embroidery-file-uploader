import speakeasy from "speakeasy";
import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const secret = speakeasy.generateSecret();
  await kv.set(`mfa:${session.user.username}`, secret.base32);

  return res.status(200).json({ secret: secret.otpauth_url });
}
