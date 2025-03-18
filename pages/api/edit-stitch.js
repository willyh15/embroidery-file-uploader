export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Destructure fileUrl and edits from the request body
  const { fileUrl, edits } = req.body;
  
  // Validate the required parameters
  if (!fileUrl || !edits) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    // Call the external auto-stitch API
    const response = await fetch("https://your-render-api.com/edit-stitch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl, edits }),
    });

    if (!response.ok) {
      throw new Error("Failed to edit the file");
    }

    const data = await response.json();

    // Return the edited file information from the external API
    return res.status(200).json({ editedFile: data.edited_file });
  } catch (error) {
    console.error("Error in edit-stitch handler:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}