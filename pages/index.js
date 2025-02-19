import { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";



export default function Home() {
  const { data: session } = useSession();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const dropRef = useRef(null);

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

  // Handle file upload via input or drag & drop
  const handleUpload = async (selectedFiles) => {
    if (!selectedFiles.length) return;

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

  // Handle drag & drop
  const handleDrop = (event) => {
    event.preventDefault();
    const selectedFiles = Array.from(event.dataTransfer.files);
    handleUpload(selectedFiles);
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

  // Highlight drop zone
  useEffect(() => {
    const dropArea = dropRef.current;
    if (!dropArea) return;

    const handleDragOver = (event) => {
      event.preventDefault();
      dropArea.style.border = "2px dashed #4CAF50";
    };

    const handleDragLeave = () => {
      dropArea.style.border = "2px dashed #ccc";
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("dragleave", handleDragLeave);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {session ? (
        <>
          <p>Welcome, {session.user.username}!</p>
          <button onClick={() => signOut()}>Logout</button>

        {/* File upload UI */}
        </>
      ) : (
        <>
          <p>Please log in to upload files.</p>
          <button onClick={() => signIn()}>Login</button>
      <h1>Embroidery File Uploader</h1>
      
      <div
        ref={dropRef}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        Drag & Drop files here or
        <input type="file" multiple onChange={(e) => handleUpload(Array.from(e.target.files))} />
      </div>

      {uploading && <progress value={uploadProgress} max="100"></progress>}
      {message && <p>{message}</p>}

      <button onClick={() => setShowModal(true)}>View Files</button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "20px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <h2>Uploaded Files</h2>
          <button onClick={() => setShowModal(false)}>Close</button>
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
      )}
    </div>
  );
}
