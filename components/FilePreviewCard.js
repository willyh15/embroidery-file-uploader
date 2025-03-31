// /components/FilePreviewCard.js
import VisibilityToggle from "./VisibilityToggle";
import FileActions from "./FileActions";

export default function FilePreviewCard({
  file,
  onConvert,
  onPreview,
  onAutoStitch,
  onRetry,
  onDownload,
  onToggleVisibility,
  onEdit,
  onDownloadAll,
  onVectorPreview
}) {
  const fileName = file.name || file.url?.split("/").pop() || "Untitled";

  return (
    <div className="file-card">
      <div className="file-card-header">
        <strong>{fileName}</strong>
        <div className="badges">
          {file.status && <span className="badge">{file.status}</span>}
          {file.stage && file.stage !== "done" && file.stage !== "pending" && (
            <span className="badge info">{file.stage}</span>
          )}
          {file.status === "Converted" && (
            <span className="badge success">DST/PES Ready</span>
          )}
          {file.status === "Error" && <span className="badge error">Failed</span>}
        </div>
        {onToggleVisibility && (
          <VisibilityToggle
            visibility={file.visibility}
            onToggle={() => onToggleVisibility(file.url)}
          />
        )}
      </div>

      {file.progress !== undefined && (
        <div className="progress-bar" style={{ marginTop: "4px" }}>
          <div
            className="progress-fill"
            style={{
              height: "6px",
              width: `${file.progress}%`,
              backgroundColor: "#4caf50",
              borderRadius: "4px",
            }}
          />
        </div>
      )}

      <FileActions
        file={file}
        onConvert={onConvert}
        onPreview={onPreview}
        onAutoStitch={onAutoStitch}
        onRetry={onRetry}
        onDownload={onDownload}
        onDownloadAll={onDownloadAll}
        onEdit={onEdit}
        onVectorPreview={onVectorPreview}
      />
    </div>
  );
}
