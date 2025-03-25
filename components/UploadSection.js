import { useRef, useState } from "react";
import Button from "./Button";
import { UploadIcon } from "./Icons";

export default function UploadSection({
  handleUpload,
  uploading,
  uploadProgress,
  setHovering,
}) {
  const dropRef = useRef(null);

  return (
    <div className="upload-section">
      <div
        ref={dropRef}
        className={`upload-box soft-shadow ${uploading ? "dragover" : ""}`}
        onDragEnter={() => setHovering(true)}
        onDragLeave={() => setHovering(false)}
      >
        <UploadIcon />
        Drag & Drop files here or
        <input
          type="file"
          multiple
          onChange={(e) => handleUpload(Array.from(e.target.files))}
        />
      </div>
      <Button style={{ marginTop: "1rem" }} onClick={() => handleUpload([])}>
        Upload File
      </Button>
      {uploading && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}
    </div>
  );
}