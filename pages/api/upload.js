import formidable from "formidable";

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
      return res.status(500).json({ error: "Error parsing the files" });
    }

    const formData = new FormData();

    // Handle multiple files
    const uploadedFiles = files.files instanceof Array ? files.files : [files.files];

    uploadedFiles.forEach((file) => {
      formData.append("files", new Blob([fs.readFileSync(file.filepath)]), file.originalFilename);
    });

    try {
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