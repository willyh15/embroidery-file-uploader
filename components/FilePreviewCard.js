import Button from "./Button";

export default function FilePreviewCard({
  file,
  onConvert,
  onPreview,
  onAutoStitch,
}) {
  return (
    <div className="file-card">
      <div className="file-card-header">
        <strong>{file.name}</strong>
        <div className="badges">
          {file.status && <span className="badge">{file.status}</span>}
          {file.status === "Converted" && (
            <span className="badge success">DST/PES Ready</span>
          )}
        </div>
      </div>

      <div className="file-card-actions">
        <Button onClick={onAutoStitch}>Auto-Stitch</Button>
        <Button onClick={onConvert}>Convert</Button>
        <Button onClick={onPreview}>Preview</Button>
        {file.convertedUrl && (
          <a
            href={file.convertedUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            style={{ marginLeft: "1rem" }}
          >
            <Button>Download</Button>
          </a>
        )}
      </div>
    </div>
  );
}