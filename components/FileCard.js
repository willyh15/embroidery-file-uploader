// components/FileCard.js
import { useState } from "react";

export default function FileCard({ file, onConvert, onDownload, onPreview, onEdit }) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
  setRetrying(true);
  try {
    await onConvert(file.url);
    toast.success("Retry started successfully!");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("[Retry Error]", err);
    toast.error("Retry failed. Please try again.");
  } finally {
    setRetrying(false);
  }
};

  const renderStatusBadge = () => {
    switch (file.status) {
      case "Uploaded":
        return <span className="badge uploaded">Uploaded</span>;
      case "Converting":
        return <span className="badge converting">Converting ({file.stage})</span>;
      case "Converted":
        return <span className="badge converted">Converted</span>;
      case "Error":
        return <span className="badge error">Error ({file.stage})</span>;
      default:
        return <span className="badge unknown">Unknown</span>;
    }
  };

  return (
    <div className="file-card">
      <div className="file-header">
        <strong>{file.name || "Unnamed file"}</strong>
        {renderStatusBadge()}
      </div>

      <div className="file-actions">
        {file.status === "Uploaded" && (
          <button onClick={() => onConvert(file.url)} className="action-button convert">
            Convert
          </button>
        )}

        {file.status === "Error" && (
          <button onClick={handleRetry} className="action-button retry" disabled={retrying}>
            {retrying ? "Retrying..." : "Retry"}
          </button>
        )}

        {file.status === "Converted" && (
          <>
            <button onClick={() => onDownload(file.url, "pes")} className="action-button download">
              Download PES
            </button>
            <button onClick={() => onPreview(file.url)} className="action-button preview">
              Preview
            </button>
            <button onClick={() => onEdit(file.url)} className="action-button edit">
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}