import { useEffect, useState } from "react";
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
  onVectorPreview,
}) {
  const fileName = file.name || file.url?.split("/").pop() || "Untitled";
  const [downloadCount, setDownloadCount] = useState(null);
  const [downloadLogs, setDownloadLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const fetchDownloadStats = async () => {
    try {
      const res = await fetch(`/api/get-download-stats?fileUrl=${encodeURIComponent(file.url)}`);
      const data = await res.json();
      if (res.ok) {
        setDownloadCount(data.count || 0);
        setDownloadLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Download stats fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDownloadStats();
    const interval = setInterval(fetchDownloadStats, 10000);
    return () => clearInterval(interval);
  }, [file.url]);

  const formatStage = (stage) =>
    stage.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="file-card">
      <div className="file-card-header">
        <strong>{fileName}</strong>
        <div className="badges">
          {file.status && <span className="badge">{file.status}</span>}
          {file.stage && file.stage !== "done" && (
            <span className="badge info" title={`${file.status} (${formatStage(file.stage)})`}>
              {formatStage(file.stage)}
            </span>
          )}
          {file.status === "Converted" && file.convertedUrl && (
            <span className="badge success">PES Ready</span>
          )}
          {file.status === "Error" && (
            <span className="badge error">{file.stage || "Error"}</span>
          )}
          {downloadCount !== null && (
            <span className="badge">{downloadCount} downloads</span>
          )}
        </div>
        {onToggleVisibility && (
          <VisibilityToggle
            visibility={file.visibility}
            onToggle={() => onToggleVisibility(file.url)}
          />
        )}
      </div>

      {typeof file.progress === "number" && (
        <div className="progress-bar" title={`Progress: ${file.progress}%`}>
          <div
            className="progress-fill"
            style={{
              width: `${file.progress}%`,
              backgroundColor:
                file.status === "Error"
                  ? "#f44336"
                  : file.progress === 100
                  ? "#4caf50"
                  : "#2196f3",
            }}
          />
        </div>
      )}

      <FileActions
        file={file}
        onConvert={onConvert}
        onAutoStitch={onAutoStitch}
        onPreview={onPreview}
        onEdit={onEdit}
        onRetry={onRetry}
        onDownload={onDownload}
        onDownloadAll={onDownloadAll}
        onVectorPreview={onVectorPreview}
      />

      {file.convertedUrl && (
        <div style={{ marginTop: "0.5rem" }}>
          <a
            href={file.convertedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="download-link"
            onClick={() => onDownload?.(file.url, "pes")}
          >
            Download PES
          </a>
        </div>
      )}

      {downloadLogs.length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          <button onClick={() => setShowLogs(!showLogs)}>
            {showLogs ? "Hide" : "View"} Download Logs
          </button>
          {showLogs && (
            <ul className="download-log">
              {downloadLogs.map((log, i) => (
                <li key={i}>
                  [{log.type?.toUpperCase() || "?"}] {new Date(log.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}