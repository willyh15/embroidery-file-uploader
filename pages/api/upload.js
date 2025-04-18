// pages/api/upload.js
import { IncomingForm } from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(500).json({ error: "Error parsing upload" });
    }

    try {
      const formData = new FormData();
      const fileArray = Array.isArray(files.files) ? files.files : [files.files];

      for (const file of fileArray) {
        const buffer = fs.readFileSync(file.filepath);
        const safeName = path.basename(file.originalFilename || "upload");
        formData.append("files", buffer, safeName);
      }

      const flaskUrl = `${process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org"}/upload`;

      const response = await fetch(flaskUrl, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      const text = await response.text();
      if (!text.trim()) return res.status(502).json({ error: "Empty response from Flask" });

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        return res.status(500).json({ error: "Invalid JSON from Flask", raw: text });
      }

      if (!response.ok) throw new Error(data.error || "Flask upload failed");

      return res.status(200).json(data);
    } catch (err) {
      console.error("Upload API error:", err);
      return res.status(500).json({ error: err.message });
    }
  });
}