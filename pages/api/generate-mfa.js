import speakeasy from "speakeasy";
import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  const secret = speakeasy.generateSecret({ length: 20 });

  await kv.set(`mfa:${username}`, secret.base32);

  res.status(200).json({ secret: secret.base32 });
}