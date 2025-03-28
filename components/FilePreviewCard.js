// /components/FilePreviewCard.js
import Button from "./Button";
import VisibilityToggle from "./VisibilityToggle";

export default function FilePreviewCard({
  file,
  onConvert,
  onPreview,
  onAutoStitch,
  onRetry,
  onDownload,
  onToggleVisibility,
  onEdit,            // <--- New: for "Edit/Optimize"
  onDownloadAll,     // <--- New: for "Download All" convenience
}) {
  // Optional: parse a human-friendly file name; you can also rely on `file.name` directly
  const fileName = file.name || file.url?.split("/").pop() || "Untitled";

  return (
    <div className="file-card">
      {/* HEADER */}
      <div className="file-card-header">
        <strong>{fileName}</strong>

        <div className="badges">
          {/* 1) Basic status badge */}
          {file.status && <span className="badge">{file.status}</span>}

          {/* 2) Stage badge (if it's neither 'done' nor 'pending') */}
          {file.stage && file.stage !== "done" && file.stage !== "pending" && (
            <span className="badge info">{file.stage}</span>
          )}

          {/* 3) If fully converted */}
          {file.status === "Converted" && (
            <span className="badge success">DST/PES Ready</span>
          )}

          {/* 4) If error */}
          {file.status === "Error" && <span className="badge error">Failed</span>}
        </div>

        {/* Visibility toggle if available */}
        {onToggleVisibility && (
          <VisibilityToggle
            visibility={file.visibility}
            onToggle={() => onToggleVisibility(file.url)}
          />
        )}
      </div>

      {/* PROGRESS BAR */}
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

      {/* ACTION BUTTONS */}
      <div className="file-card-actions">
        <Button onClick={onAutoStitch}>Auto-Stitch</Button>
        <Button onClick={onConvert}>Convert</Button>
        <Button onClick={onPreview}>Preview</Button>

        {/* NEW: Edit/Optimize button */}
        {onEdit && (
          <Button onClick={() => onEdit(file.url)}>Edit/Optimize</Button>
        )}

        {/* Download .DST if available */}
        {file.convertedDst && (
          <a
            href={`/api/serve-file?fileUrl=${encodeURIComponent(file.convertedDst)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDownload?.(file.url, "dst")}
          >
            <Button>Download .DST</Button>
          </a>
        )}

        {/* Download .PES if available */}
        {file.convertedPes && (
          <a
            href={`/api/serve-file?fileUrl=${encodeURIComponent(file.convertedPes)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDownload?.(file.url, "pes")}
          >
            <Button>Download .PES</Button>
          </a>
        )}

        {/* Optional: Download All if both exist */}
        {onDownloadAll && file.convertedDst && file.convertedPes && (
          <Button onClick={() => onDownloadAll(file.url)}>Download All</Button>
        )}

        {/* Retry if there's an error */}
        {file.status === "Error" && onRetry && (
          <Button onClick={onRetry}>Retry</Button>
        )}
      </div>
    </div>
  );
}