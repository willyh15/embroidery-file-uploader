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
          {file.status === "Converted" && <span className="badge success">DST/PES Ready</span>}
        </div>
      </div>

      {file.progress !== undefined && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${file.progress}%` }}
          />
        </div>
      )}

      <div className="file-card-actions">
        <Button onClick={onAutoStitch}>Auto-Stitch</Button>
        <Button onClick={onConvert}>Convert</Button>
        <Button onClick={onPreview}>Preview</Button>
        {file.downloadUrl && (
          <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer" download>
            <Button>Download</Button>
          </a>
        )}
      </div>
    </div>
  );
}