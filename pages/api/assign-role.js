export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { username, roleName } = req.body;

  if (!username || !roleName) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  await kv.hset(`user:${username}`, { role: roleName });

  return res.status(200).json({ message: `Role assigned to ${username}` });
}
