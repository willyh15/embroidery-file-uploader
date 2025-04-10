import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";

const FLASK_BASE = process.env.NEXT_PUBLIC_FLASK_BASE_URL || "https://embroideryfiles.duckdns.org";

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dropRef = useRef(null);

  const [isClient, setIsClient] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

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
        stage: "",
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
    updateFileStatus(fileUrl, "Converting", "initiating");

    try {
      const res = await fetch("/api/convert-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.taskId) throw new Error("Conversion failed to start");

      updateFileStatus(fileUrl, "Converting", "processing");
      pollConversionStatus(data.taskId, fileUrl);
    } catch (err) {
      toast.error(err.message);
      updateFileStatus(fileUrl, "Error", "failed");
    }
  };

  const pollConversionStatus = (taskId, fileUrl) => {
    const interval = setInterval(async () => {
      try {
        const statusUrl = `${FLASK_BASE}/status/${taskId}`;
        const res = await fetch(statusUrl);
        const statusData = await res.json();

        if (statusData.state === "done") {
          updateFileStatus(fileUrl, "Converted", "done", statusData.pesUrl);
          clearInterval(interval);
          toast.success("Conversion complete");
        } else if (statusData.state === "error") {
          updateFileStatus(fileUrl, "Error", "failed");
          clearInterval(interval);
          toast.error("Conversion failed");
        } else {
          updateFileStatus(fileUrl, "Converting", statusData.state);
        }
      } catch (err) {
        console.error("Polling error:", err);
        toast.error("Polling error");
        clearInterval(interval);
      }
    }, 3000);
  };

  const updateFileStatus = (fileUrl, status, stage = "", pesUrl = "") => {
    setUploadedFiles(prev =>
      prev.map(f => f.url === fileUrl ? { ...f, status, stage, convertedPes: pesUrl } : f)
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

      {uploadedFiles.map(file => (
        <div key={file.url} className="file-card">
          <div className="file-card-header">
            <strong>{file.name}</strong>
            {file.status && <span className="badge">{file.status}</span>}
            {file.stage && <span className="badge info">{file.stage}</span>}
          </div>

          <div className="file-actions">
            {file.status === "Uploaded" && (
              <button onClick={() => handleConvert(file.url)}>Convert</button>
            )}
            {file.status === "Converting" && <span>Conversion in progress...</span>}
            {file.status === "Converted" && file.convertedPes && (
              <a
                href={file.convertedPes}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleDownload(file.url, "pes")}
              >
                <button>Download PES</button>
              </a>
            )}
            {file.status === "Error" && (
              <button onClick={() => handleConvert(file.url)}>Retry</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
