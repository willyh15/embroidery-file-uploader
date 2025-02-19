import { list } from "@vercel/blob";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  try {
    const { blobs } = await list();
    
    // Filter files for the logged-in user
    const userFiles = blobs.filter(blob => blob.url.includes(`users/${session.user.username}/`));
    
    const paginatedFiles = userFiles.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({
      files: paginatedFiles.map((blob) => blob.url),
      totalFiles: userFiles.length,
      totalPages: Math.ceil(userFiles.length / limitNum),
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch files", details: error.message });
  }
}
