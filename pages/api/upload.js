export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const formData = new FormData();
    const files = req.body.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    files.forEach(file => formData.append("files", file));

    const flaskResponse = await fetch("http://23.94.202.56:5000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await flaskResponse.json();

    if (!flaskResponse.ok) throw new Error(data.error || "Flask upload failed");

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};