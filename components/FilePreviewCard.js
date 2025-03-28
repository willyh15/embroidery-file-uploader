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
}) {
  return (
    <div className="file-card">
      <div className="file-card-header">
        <strong>{file.name}</strong>
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

      <div className="file-card-actions">
        <Button onClick={onAutoStitch}>Auto-Stitch</Button>
        <Button onClick={onConvert}>Convert</Button>
        <Button onClick={onPreview}>Preview</Button>

        {file.convertedDst && (
          <a
            href={`/api/serve-file?fileUrl=${encodeURIComponent(file.convertedDst)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDownload(file.url, "dst")}
          >
            <Button>Download .DST</Button>
          </a>
        )}

        {file.convertedPes && (
          <a
            href={`/api/serve-file?fileUrl=${encodeURIComponent(file.convertedPes)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDownload(file.url, "pes")}
          >
            <Button>Download .PES</Button>
          </a>
        )}

        {file.status === "Error" && onRetry && (
          <Button onClick={onRetry}>Retry</Button>
        )}
      </div>
    </div>
  );
}