import { list } from "@vercel/blob";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  // Ensure the user is authenticated.
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Parse pagination parameters from the query string.
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  try {
    // Retrieve the list of blobs from Vercel Blob.
    const { blobs } = await list();

    // Filter blobs to include only those that belong to the logged-in user.
    // Here we assume that each blob's URL contains a path segment like "users/<username>/"
    const userFiles = blobs.filter(blob => blob.url.includes(`users/${session.user.username}/`));

    // Apply pagination to the filtered list.
    const paginatedFiles = userFiles.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Respond with the paginated file URLs and pagination metadata.
    return res.status(200).json({
      files: paginatedFiles.map(blob => blob.url),
      totalFiles: userFiles.length,
      totalPages: Math.ceil(userFiles.length / limitNum),
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return res.status(500).json({ error: "Failed to fetch files", details: error.message });
  }
}