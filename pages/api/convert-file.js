// /pages/api/convert-file.js
import { getSession } from "next-auth/react";
import { writeFile, unlink } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { exec } from "child_process";
import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  try {
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(buffer);

    const tempDir = "/tmp";
    const inputName = uuidv4() + path.extname(fileUrl).toLowerCase();
    const outputName = inputName.replace(path.extname(inputName), ".pes");

    const inputPath = path.join(tempDir, inputName);
    const outputPath = path.join(tempDir, outputName);

    await writeFile(inputPath, inputBuffer);

    // Simulate Ink/Stitch conversion
    const cmd = `inkstitch "${inputPath}" -o "${outputPath}"`;

    await new Promise((resolve, reject) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          console.error("Ink/Stitch Error:", stderr);
          return reject(new Error("Ink/Stitch CLI failed"));
        }
        resolve(stdout);
      });
    });

    const outBuffer = await readFile(outputPath);
    const blob = await put(`converted/${session.user.username}/${outputName}`, outBuffer, {
      access: "public",
    });

    await unlink(inputPath);
    await unlink(outputPath);

    return res.status(200).json({ convertedUrl: blob.url });
  } catch (error) {
    console.error("Conversion failed:", error);
    return res.status(500).json({ error: "Conversion failed", details: error.message });
  }
}
