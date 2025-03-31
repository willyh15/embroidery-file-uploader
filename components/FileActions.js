// /components/FileActions.js
import Button from "./Button";

export default function FileActions({
  file,
  onConvert,
  onAutoStitch,
  onPreview,
  onEdit,
  onRetry,
  onDownload,
  onDownloadAll,
  onVectorPreview,
}) {
  return (
    <div className="file-card-actions">
      <Button onClick={onAutoStitch}>Auto-Stitch</Button>
      <Button onClick={onConvert}>Convert</Button>
      <Button onClick={onPreview}>Preview</Button>

      {onEdit && (
        <Button onClick={() => onEdit(file.url)}>Edit/Optimize</Button>
      )}

      {onVectorPreview && (
        <Button onClick={() => onVectorPreview(file.url)}>Vector Preview</Button>
      )}

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

      {onDownloadAll && file.convertedDst && file.convertedPes && (
        <Button onClick={() => onDownloadAll(file.url)}>Download All</Button>
      )}

      {file.status === "Error" && onRetry && (
        <Button onClick={onRetry}>Retry</Button>
      )}
    </div>
  );
}
