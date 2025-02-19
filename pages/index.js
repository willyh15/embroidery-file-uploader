import { useState, useEffect } from "react";

export default function Home() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");

  // Fetch existing uploaded files on load
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/api/list-files");
        const data = await response.json();
        if (response.ok) {
          setUploadedFiles(data.files);
        } else {
          console.error("Error fetching files:", data.error);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, []);

  const handleUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadedFiles([...uploadedFiles, ...data.urls]);
      setMessage("Upload successful!");
    } catch (error) {
      setMessage("Upload failed. Please try again.");
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const handleDelete = async (fileUrl) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch("/api/delete-file", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setUploadedFiles(uploadedFiles.filter((url) => url !== fileUrl));
      setMessage("File deleted successfully.");
    } catch (error) {
      setMessage("Error deleting file.");
      console.error("Delete error:", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Embroidery File Uploader</h1>

      <input type="file" multiple onChange={handleUpload} />
      {uploading && <progress value={uploadProgress} max="100"></progress>}

      {message && <p>{message}</p>}

      <h2>Uploaded Files</h2>
      <ul>
        {uploadedFiles.map((url, index) => (
          <li key={index} style={{ marginBottom: "10px" }}>
            {url.match(/\.(png|jpe?g|webp)$/) ? (
              <img src={url} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover", marginRight: "10px" }} />
            ) : (
              <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
            )}
            <button onClick={() => handleDelete(url)} style={{ marginLeft: "10px", cursor: "pointer" }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
