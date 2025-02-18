const AWS_LAMBDA_URL = "https://your-api-gateway.amazonaws.com/convert";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fileUrl, format } = req.body;

  const response = await fetch(AWS_LAMBDA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, format }),
  });

  const data = await response.json();
  return res.status(200).json({ convertedFile: data.converted_file });
};