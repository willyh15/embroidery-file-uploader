import React from "react";
import { ArrowDownCircle, RotateCw, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function FileCard({ file, onConvert, onDownload }) {
  if (!file || typeof file !== "object") return null;

  const getStageColor = (stage) => {
    switch (stage) {
      case "downloading": return "bg-blue-500";
      case "resizing": return "bg-yellow-500";
      case "vectorizing": return "bg-orange-500";
      case "converting-pes": return "bg-purple-500";
      case "done": return "bg-green-600";
      case "failed":
      case "error": return "bg-red-600";
      default: return "bg-gray-400";
    }
  };

  const renderStatusIcon = () => {
    if (file.status === "Converting") return <Loader2 className="animate-spin text-blue-500 w-5 h-5" />;
    if (file.status === "Converted") return <CheckCircle className="text-green-500 w-5 h-5" />;
    if (file.status === "Error") return <XCircle className="text-red-500 w-5 h-5" />;
    return null;
  };

  return (
    <div className="bg-white shadow rounded p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <strong>{file.name || "Unnamed file"}</strong>
          {renderStatusIcon()}
        </div>
        <div className="text-sm text-gray-600">{file.status || "Unknown"}</div>
      </div>

      {file.stage && (
        <div className="h-2 w-full rounded bg-gray-200 overflow-hidden mb-3">
          <div
            className={`h-2 transition-all duration-700 ease-in-out ${getStageColor(file.stage)} animate-pulse`}
            style={{ width: "100%" }}
          />
        </div>
      )}

      <div className="flex items-center space-x-4">
        {file.status === "Uploaded" && (
          <button onClick={onConvert} className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            <RotateCw className="inline-block w-4 h-4 mr-1" /> Convert
          </button>
        )}
        {file.status === "Converting" && <span className="text-sm text-blue-600">Conversion in progress...</span>}
        {file.status === "Converted" && file.convertedPes && (
          <a
            href={file.convertedPes}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onDownload}
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <ArrowDownCircle className="inline-block w-4 h-4 mr-1" /> Download PES
          </a>
        )}
        {file.status === "Error" && (
          <button onClick={onConvert} className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600">
            <RotateCw className="inline-block w-4 h-4 mr-1" /> Retry
          </button>
        )}
      </div>
    </div>
  );
}