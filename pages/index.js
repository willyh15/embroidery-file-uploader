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
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchDownloadStats = async () => {
      const stats = {};
      for (const file of uploadedFiles) {
        try {
          const res = await fetch(`/api/get-download-stats?fileUrl=${encodeURIComponent(file.url)}`);
          const data = await res.json();
          if (res.ok) stats[file.url] = data;
        } catch (err) {
          console.error("Stats error:", err);
        }
      }
      setDownloadStats(stats);
    };
    if (uploadedFiles.length > 0) fetchDownloadStats();
  }, [uploadedFiles]);

  const updateFileStatus = (url, status, stage = "", pesUrl = "") => {
    setUploadedFiles(prev =>
      prev.map(f => f.url === url ? { ...f, status, stage, convertedPes: pesUrl } : f)
    );
  };

  const handleUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);

    const uploaded = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("files", files[i]);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.urls?.length) {
          throw new Error(data.error || "Upload failed");
        }

        uploaded.push({
          url: data.urls[0].url,
          name: files[i].name,
          status: "Uploaded",
          progress: 100,
        });

        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        toast.error(`Upload failed for ${files[i].name}`);
        console.error(err);
      }
    }

    setUploadedFiles((prev) => [...prev, ...uploaded]);
    setUploading(false);
    toast.success("Upload complete");
  };

  const handleConvert = async (fileUrl) => {
    try {
      const res = await fetch("/api/convert-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const text = await res.text();
      const result = JSON.parse(text);
      if (!res.ok || !result.pesUrl) throw new Error("No PES URL");
      updateFileStatus(fileUrl, "Converted", "done", result.pesUrl);
      toast.success("Converted!");
    } catch (err) {
      toast.error("Conversion failed");
      updateFileStatus(fileUrl, "Error", "failed");
    }
  };

  const handleDownload = async (fileUrl, format) => {
    try {
      await fetch("/api/log-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, format }),
      });
    } catch (err) {
      console.error("Log error:", err);
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
            {downloadStats[file.url] && (
              <span className="badge">{downloadStats[file.url].count || 0} downloads</span>
            )}
          </div>

          {typeof file.progress === "number" && (
            <div className="progress-bar" title={`${file.progress}%`}>
              <div
                className="progress-fill"
                style={{ width: `${file.progress}%` }}
              />
            </div>
          )}

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