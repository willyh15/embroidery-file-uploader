export default async function handler(req, res) {
  const { username, token } = req.body;

  if (!username || !token) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const secret = await kv.get(`2fa:${username}`);
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
}
