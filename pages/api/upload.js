import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable Error:", err);
      return res.status(500).json({ error: "Error parsing files" });
    }

    try {
      const formData = new FormData();

      // Ensure files are handled as an array
      const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];

      uploadedFiles.forEach((file) => {
        const fileBuffer = fs.readFileSync(file.filepath);
        formData.append("files", fileBuffer, file.originalFilename);
      });

      const flaskResponse = await fetch("http://23.94.202.56:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await flaskResponse.json();

      if (!flaskResponse.ok) throw new Error(data.error || "Flask upload failed");

      return res.status(200).json(data);
    } catch (error) {
      console.error("Upload Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });
}