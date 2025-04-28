import { useCallback, useState } from "react";
import toast from "react-hot-toast";

const FLASK_BASE = "https://embroideryfiles.duckdns.org";

export default function UploadBox({ uploading, dropRef, onUploadSuccess }) {
  const [localUploading, setLocalUploading] = useState(false);

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(async (e) => {
    preventDefaults(e);
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
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  setLocalUploading(true);
  toast.loading("Uploading files...", { id: "uploading" });

  try {
    const response = await fetch(`${FLASK_BASE}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Server response not readable");
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      throw new Error("Failed to parse server JSON response");
    }

    if (onUploadSuccess && data?.urls) {
      onUploadSuccess(data.urls);
    }
    toast.success("Upload complete!", { id: "uploading" });

  } catch (err) {
    const extractedMessage = err?.message || "Unknown upload error";
    console.error("[Upload Error]", extractedMessage, err);
    toast.error(`Upload failed: ${extractedMessage}`, { id: "uploading" });

  } finally {
    setLocalUploading(false);
  }
};

  const uploadingState = uploading || localUploading;

  return (
    <div
      ref={dropRef}
      onDragEnter={preventDefaults}
      onDragOver={preventDefaults}
      onDragLeave={preventDefaults}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center border-4 border-dashed rounded-lg p-8 transition-all duration-300 ${
        uploadingState
          ? "border-blue-400 bg-blue-50 animate-pulse"
          : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
      }`}
    >
      <label className="flex flex-col items-center cursor-pointer">
        <span className="text-lg font-semibold text-gray-600 mb-2">
          {uploadingState ? "Uploading..." : "Drag & drop files here or click to select"}
        </span>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={handleSelectFiles}
          disabled={uploadingState}
        />
      </label>
    </div>
  );
}