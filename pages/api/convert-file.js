const AWS_LAMBDA_URL = "https://your-api-gateway.amazonaws.com/convert";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl, format } = req.body;

  // Ensure required parameters are provided
  if (!fileUrl || !format) {
    return res.status(400).json({ error: "File URL and format are required" });
  }

  try {
    const response = await fetch(AWS_LAMBDA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl, format }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AWS Lambda error: ${errorText}`);
    }

    const data = await response.json();
    return res.status(200).json({ convertedFile: data.converted_file });
  } catch (error) {
    console.error("Error converting file:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}