import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const files = req.body.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files provided" });
  }

  const uploadedFiles = [];
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".pes", ".dst"];

  try {
    for (const file of files) {
      const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ error: `File type ${fileExtension} is not allowed.` });
      }

      // Categorize files based on type
      const folder =
        fileExtension === ".pes" || fileExtension === ".dst" ? "embroidery" : "images";

      const filePath = `${folder}/${file.name}`;

      const { url } = await put(filePath, file, { access: "public" });
      uploadedFiles.push(url);
    }

    return res.status(200).json({ urls: uploadedFiles });
  } catch (error) {
    return res.status(500).json({ error: "Upload failed", details: error.message });
  }
}
