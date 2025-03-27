import Button from "./Button";

export default function FilePreviewCard({
  file,
  onConvert,
  onPreview,
  onAutoStitch,
  onRetry,
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
          <a href={file.convertedDst} target="_blank" rel="noopener noreferrer" download>
            <Button>Download .DST</Button>
          </a>
        )}
        {file.convertedPes && (
          <a href={file.convertedPes} target="_blank" rel="noopener noreferrer" download>
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