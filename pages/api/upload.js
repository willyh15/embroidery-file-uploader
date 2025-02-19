import { put } from "@vercel/blob";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userFolder = `users/${session.user.username}/`; // Store files in user-specific folders

  const expiryDays = 30; // Files auto-delete after 30 days

try {
  for (const file of files) {
    const filePath = `${userFolder}${file.name}`;
    const { url } = await put(filePath, file, { access: "public" });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    uploadedFiles.push({ url, expiryDate });
  }

  return res.status(200).json({ urls: uploadedFiles });
}


  const files = req.body.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files provided" });
  }

  const uploadedFiles = [];

  try {
    for (const file of files) {
      const filePath = `${userFolder}${file.name}`;
      const { url } = await put(filePath, file, { access: "public" });
      uploadedFiles.push(url);
    }

    return res.status(200).json({ urls: uploadedFiles });
  } catch (error) {
    return res.status(500).json({ error: "Upload failed", details: error.message });
  }
}

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

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
