import { useRef } from "react";
import Button from "./Button";
import { UploadIcon } from "./Icons";

export default function UploadSection({
  onUpload,       // <<--- renamed to onUpload for clarity
  uploading,
  uploadProgress,
  setHovering,    // optional, only if you want drag styling
}) {
  const dropRef = useRef(null);

  return (
    <div className="upload-section">
      <div
        ref={dropRef}
        className={`upload-box soft-shadow ${uploading ? "dragover" : ""}`}
        onDragEnter={() => setHovering && setHovering(true)}
        onDragLeave={() => setHovering && setHovering(false)}
      >
        <UploadIcon />
        Drag & Drop files here or
        <input
          type="file"
          multiple
          onChange={(e) => {
            if (!onUpload) return;
            onUpload(Array.from(e.target.files));
          }}
        />
      </div>

      <Button style={{ marginTop: "1rem" }} onClick={() => onUpload && onUpload([])}>
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