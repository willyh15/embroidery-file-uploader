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
      } else {
        console.warn("Failed to fetch download stats", data);
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

  const formatStage = (stage) => {
    return stage
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="file-card">
      <div className="file-card-header">
        <strong>{fileName}</strong>
        <div className="badges">
          {file.status && <span className="badge">{file.status}</span>}

          {file.stage && file.stage !== "done" && file.stage !== "pending" && (
            <span
              className="badge info"
              title={`${file.status || "Processing"} (${formatStage(file.stage)})\n${
                file.timestamp ? new Date(file.timestamp).toLocaleString() : ""
              }`}
            >
              {formatStage(file.stage)}
            </span>
          )}

          {(file.status === "Converted" && file.convertedUrl) && (
            <span className="badge success">DST/PES Ready</span>
          )}

          {file.status === "Error" && (
            <span className="badge error" title={file.stage}>
              Failed
            </span>
          )}

          {downloadCount !== null && (
            <span className="badge" title="Total downloads">
              {downloadCount} downloads
            </span>
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
        <div
          className="progress-bar"
          title={`Progress: ${file.progress}%`}
          style={{ marginTop: "4px" }}
        >
          <div
            className="progress-fill"
            style={{
              height: "6px",
              width: `${file.progress}%`,
              backgroundColor:
                file.status === "Error"
                  ? "#f44336"
                  : file.progress === 100
                  ? "#4caf50"
                  : "#2196f3",
              borderRadius: "4px",
              transition: "width 0.3s ease-in-out",
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

      {downloadLogs.length > 0 && (
        <div style={{ marginTop: "0.5rem" }}>
          <button onClick={() => setShowLogs(!showLogs)}>
            {showLogs ? "Hide" : "View"} Download Logs
          </button>
          {showLogs && (
            <ul style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
              {downloadLogs.map((log, i) => (
                <li key={i}>
                  [{log.type?.toUpperCase() || "?"}]{" "}
                  {new Date(log.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}