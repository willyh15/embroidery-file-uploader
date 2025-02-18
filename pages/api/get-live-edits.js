import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  const edits = await kv.get(`live-edit:${fileUrl}`);

  return res.status(200).json({ edits: edits ? JSON.parse(edits) : [] });
};