import { kv } from "@vercel/kv";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileNames } = req.body;
  if (!fileNames || fileNames.length === 0) {
    return res.status(400).json({ error: "No files provided" });
  }

  const rollbackFiles = [];

  for (const fileName of fileNames) {
    const versions = await kv.lrange(`versions:${fileName}`, 0, -1);
    if (versions.length < 2) continue; // Skip if no previous versions

    const previousVersion = JSON.parse(versions[1]); // Second latest version
    rollbackFiles.push({ fileName, url: previousVersion.url });

    // Remove latest version and keep previous
    await kv.ltrim(`versions:${fileName}`, 1, -1);
  }

  return res.status(200).json({ rollbackFiles });
}
