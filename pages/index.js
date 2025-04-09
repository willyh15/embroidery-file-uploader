import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dropRef = useRef(null);

  const [isClient, setIsClient] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadStats, setDownloadStats] = useState({});

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status]);

  const handleUpload = async (files) => {
  if (!files.length) return;

  setUploading(true);

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");

    const newFiles = data.urls.map(file => ({
      ...file,
      status: "Uploaded",
      pesUrl: "",
      taskId: "",
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success("Upload complete");
  } catch (err) {
    toast.error(err.message);
  } finally {
    setUploading(false);
  }
};

const handleConvert = async (fileUrl) => {
  try {
    const res = await fetch("/api/convert-file", {
      method: "POST",
      body: JSON.stringify({ fileUrl }),
    });

    const data = await res.json();
    if (!res.ok || !data.taskId) throw new Error("Conversion failed to start");

    pollConversionStatus(data.taskId, fileUrl);
  } catch (err) {
    toast.error(err.message);
  }
};

const pollConversionStatus = (taskId, fileUrl) => {
  const interval = setInterval(async () => {
    const res = await fetch(`http://23.94.202.56:5000/status/${taskId}`);
    const statusData = await res.json();

    if (statusData.state === "done") {
      updateFileStatus(fileUrl, "Converted", statusData.pesUrl);
      clearInterval(interval);
      toast.success("Conversion complete");
    } else if (statusData.state === "error") {
      updateFileStatus(fileUrl, "Error");
      clearInterval(interval);
      toast.error("Conversion failed");
    }
  }, 3000);
};

const updateFileStatus = (fileUrl, status, pesUrl = "") => {
  setUploadedFiles(prev =>
    prev.map(f => f.url === fileUrl ? { ...f, status, pesUrl } : f)
  );
};

  const handleDownload = async (fileUrl, format) => {
    try {
      await fetch("/api/log-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, format }),
      });
    } catch (err) {
      console.error("Download logging error:", err);
    }
  };

  if (!isClient || status === "loading") return null;
  if (!session) return null;

  return (
    <div className="container">
      <Toaster position="top-right" />
      <h2>Welcome, {session.user.name}</h2>
      <button onClick={() => signOut()}>Sign out</button>

      <div
        ref={dropRef}
        className={`upload-box ${uploading ? "dragover" : ""}`}
        onDragEnter={() => dropRef.current.classList.add("dragover")}
        onDragLeave={() => dropRef.current.classList.remove("dragover")}
      >
        <input
          type="file"
          multiple
          onChange={(e) => handleUpload(Array.from(e.target.files))}
        />
        <p>Drag & Drop files or click to upload</p>
      </div>

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      {uploadedFiles.map(file => (
        <div key={file.url} className="file-card">
          <div className="file-card-header">
            <strong>{file.name}</strong>
            {file.status && <span className="badge">{file.status}</span>}
            {file.stage && <span className="badge info">{file.stage}</span>}
          </div>

          <div className="file-actions">
            <button onClick={() => handleConvert(file.url)}>Convert</button>
            {file.convertedPes && (
              <a
                href={file.convertedPes}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleDownload(file.url, "pes")}
              >
                <button>Download PES</button>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });