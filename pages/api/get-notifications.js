export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const notifications = await kv.lrange(`notifications:${session.user.username}`, 0, -1);

  return res.status(200).json({ notifications: notifications.map((n) => JSON.parse(n)) });
}