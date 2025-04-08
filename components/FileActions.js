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

      {file.convertedPes && (
        <a
          href={file.convertedPes}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onDownload?.(file.url, "pes")}
        >
          <Button>Download .PES</Button>
        </a>
      )}

      {file.convertedDst && (
        <a
          href={file.convertedDst}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onDownload?.(file.url, "dst")}
        >
          <Button>Download .DST</Button>
        </a>
      )}

      {onDownloadAll && file.convertedPes && file.convertedDst && (
        <Button onClick={() => onDownloadAll(file.url)}>Download All</Button>
      )}

      {file.status === "Error" && onRetry && (
        <Button onClick={onRetry}>Retry</Button>
      )}
    </div>
  );
}