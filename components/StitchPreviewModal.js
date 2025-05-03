// StitchPreviewModal.js
import { useEffect, useState } from "react";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const [pesData, setPesData] = useState(null);

  useEffect(() => {
    if (!fileUrl) return;

    fetch(fileUrl)
      .then(res => res.blob())
      .then(blob => {
        setPesData({
          name: fileUrl.split("/").pop(),
          size: (blob.size / 1024).toFixed(2) + " KB"
        });
      });
  }, [fileUrl]);

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>PES File Preview</h3>
        {pesData ? (
          <>
            <p><strong>Name:</strong> {pesData.name}</p>
            <p><strong>Size:</strong> {pesData.size}</p>
            <p>Rendering coming soon...</p>
          </>
        ) : (
          <p>Loading preview...</p>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}