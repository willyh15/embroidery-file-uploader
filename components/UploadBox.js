// components/UploadBox.js
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

const FLASK_BASE = "https://embroideryfiles.duckdns.org";

export default function UploadBox({ uploading, dropRef, onUploadSuccess }) {
  const [localUploading, setLocalUploading] = useState(false);

  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const uploadFiles = async (files) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));

    setLocalUploading(true);
    toast.loading("Uploading…", { id: "upload" });

    try {
      const res = await fetch(`${FLASK_BASE}/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server ${res.status}: ${text}`);
      }
      const data = await res.json();
      onUploadSuccess?.(data.urls);
      toast.success("Upload complete!", { id: "upload" });
    } catch (err) {
      console.error(err);
      toast.error(`Upload failed: ${err.message}`, { id: "upload" });
    } finally {
      setLocalUploading(false);
    }
  };

  const handleDrop = useCallback(
    async (e) => {
      prevent(e);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) await uploadFiles(files);
    },
    []
  );

  const handleSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length) await uploadFiles(files);
  };

  const busy = uploading || localUploading;

  return (
    <div
      ref={dropRef}
      onDragEnter={prevent}
      onDragOver={prevent}
      onDragLeave={prevent}
      onDrop={handleDrop}
      className={`upload-box glass-modal transition ${
        busy
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-[var(--accent)] hover:scale-105"
      }`}
    >
      <label className="flex flex-col items-center justify-center cursor-pointer h-full">
        <span className="text-lg font-medium text-[var(--primary-text)] mb-2">
          {busy
            ? "Uploading…"
            : "Drag & drop files here or click to select"}
        </span>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={handleSelect}
          disabled={busy}
        />
      </label>
    </div>
  );
}