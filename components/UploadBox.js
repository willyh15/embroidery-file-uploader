import { useCallback } from "react";
import toast from "react-hot-toast";

const FLASK_BASE = "https://embroideryfiles.duckdns.org"; // <-- Hardcoded here too!

export default function UploadBox({ uploading, dropRef, onUploadSuccess }) {
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  }, []);

  const handleSelectFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch(`${FLASK_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      if (onUploadSuccess) {
        onUploadSuccess(data.urls);
      }
      toast.success("Upload complete!");
    } catch (err) {
      console.error("[Upload Error]", err);
      toast.error(`Upload failed: ${err.message}`);
    }
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={dropRef}
      onDragEnter={preventDefaults}
      onDragOver={preventDefaults}
      onDragLeave={preventDefaults}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center border-4 border-dashed rounded-lg p-8 transition-all duration-300 ${
        uploading
          ? "border-blue-400 bg-blue-50 animate-pulse"
          : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
      }`}
    >
      <label className="flex flex-col items-center cursor-pointer">
        <span className="text-lg font-semibold text-gray-600">
          {uploading ? "Uploading..." : "Drag & drop files here or click to select"}
        </span>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={handleSelectFiles}
          disabled={uploading}
        />
      </label>
    </div>
  );
}