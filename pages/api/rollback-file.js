export default async function handler(req, res) {
  const { fileUrl, version } = req.body;

  if (!fileUrl || !version) {
    return res.status(400).json({ error: "Missing file URL or version" });
  }

  const versions = await kv.lrange(`versions:${fileUrl}`, 0, -1);
  const selectedVersion = versions.find((v) => JSON.parse(v).version === version);

  if (!selectedVersion) {
    return res.status(404).json({ error: "Version not found" });
  }

  return res.status(200).json({ restoredFile: JSON.parse(selectedVersion).fileUrl });
};