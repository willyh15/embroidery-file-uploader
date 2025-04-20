// pages/api/progress.js
import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({ error: "Missing taskId" });
    }

    const data = await kv.get(taskId);

    if (!data) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("[Progress API Error]", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}