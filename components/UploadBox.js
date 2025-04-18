import React from "react";

function UploadBox({ uploading, dropRef, onUpload }) {
  return (
    <div
      ref={dropRef}
      className={`upload-box ${uploading ? "dragover" : ""}`}
      onDragEnter={() => dropRef.current.classList.add("dragover")}
      onDragLeave={() => dropRef.current.classList.remove("dragover")}
    >
      <input
        type="file"
        multiple
        onChange={(e) => onUpload(Array.from(e.target.files))}
      />
      <p>{uploading ? "Uploading..." : "Drag & Drop files or click to upload"}</p>
    </div>
  );
}

export default UploadBox;
