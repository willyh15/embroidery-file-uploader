// components/FileCard.js
import { FaCheckCircle, FaExclamationTriangle, FaHourglassHalf, FaSpinner } from "react-icons/fa";

export default function FileCard({ file, onConvert, onDownload, onRetry }) {
  const statusIcon = {
    Uploaded: <FaCheckCircle className="text-green-500 animate-pulse" />,
    Converting: <FaSpinner className="text-blue-500 animate-spin" />,
    Converted: <FaCheckCircle className="text-green-500" />,
    Error: <FaExclamationTriangle className="text-red-500 animate-pulse" />,
  }[file.status] || <FaHourglassHalf className="text-gray-400" />;

  return (
    <div className="file-card">
      <div className="file-card-header">
        <strong>{file.name}</strong>
        <span className="badge">{file.status}</span>
        <span className="icon ml-2">{statusIcon}</span>
        {file.stage && <span className="badge info ml-2">{file.stage}</span>}
      </div>

      <div className="progress-bar mt-2">
        <div
          className={`progress-fill ${file.status.toLowerCase()}`}
          style={{ width: file.status === "Converted" ? "100%" : "50%" }}
        />
      </div>

      <div className="file-actions mt-2">
        {file.status === "Uploaded" && (
          <button onClick={() => onConvert(file.url)}>Convert</button>
        )}
        {file.status === "Converting" && <span>Conversion in progress...</span>}
        {file.status === "Converted" && file.convertedPes && (
          <a
            href={file.convertedPes}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDownload(file.url, "pes")}
          >
            <button>Download PES</button>
          </a>
        )}
        {file.status === "Error" && (
          <button onClick={() => onRetry(file.url)}>Retry</button>
        )}
      </div>
    </div>
  );
}
