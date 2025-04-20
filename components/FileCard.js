import { Loader2, RotateCw, CheckCircle, XCircle, ArrowDownCircle } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function FileCard({ file, onConvert, onDownload, onPreview, onEdit }) {
  const [retrying, setRetrying] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [cooldownActive, setCooldownActive] = useState(false);

  useEffect(() => {
    let timer;
    if (retrying && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [retrying, countdown]);

  const handleRetry = async () => {
    setRetrying(true);
    setCountdown(3);
    try {
      await onConvert(file.url);
      toast.success("Retry started!");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
      // Start cooldown after countdown finishes
      setTimeout(() => {
        setRetrying(false);
        setCooldownActive(true);
        setTimeout(() => setCooldownActive(false), 5000); // 5 seconds cooldown
      }, 3000);
    } catch (err) {
      console.error("[Retry Error]", err);
      toast.error("Retry failed.");
      setRetrying(false);
    }
  };

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
    <div
      className={`bg-white shadow rounded p-4 mb-4 border border-gray-200 transition-all duration-500 ${
        retrying ? "ring-2 ring-blue-400 animate-pulse" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <strong>{file.name}</strong>
          {renderStatusIcon()}
        </div>
        <div className="text-sm text-gray-600">{file.status}</div>
      </div>

      {file.stage && (
        <div className="h-2 w-full rounded bg-gray-200 overflow-hidden mb-3">
          <div
            className={`h-2 transition-all duration-700 ease-in-out ${getStageColor(file.stage)} animate-pulse`}
            style={{ width: "100%" }}
          />
        </div>
      )}

      <div className="flex items-center space-x-4 flex-wrap">
        {file.status === "Uploaded" && (
          <button
            onClick={() => onConvert(file.url)}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <RotateCw className="inline-block w-4 h-4 mr-1" /> Convert
          </button>
        )}

        {file.status === "Converting" && (
          <span className="text-sm text-blue-600">Conversion in progress...</span>
        )}

        {file.status === "Converted" && file.convertedPes && (
          <a
            href={file.convertedPes}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDownload(file.url, "pes")}
            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <ArrowDownCircle className="inline-block w-4 h-4 mr-1" /> Download PES
          </a>
        )}

        {file.status === "Error" && (
          <button
            onClick={handleRetry}
            disabled={retrying || cooldownActive}
            className={`px-4 py-1 rounded ${
              retrying ? "bg-gray-400 cursor-not-allowed" :
              cooldownActive ? "bg-gray-300 cursor-not-allowed" :
              "bg-red-500 hover:bg-red-600"
            } text-white`}
          >
            {retrying ? (
              <>
                <Loader2 className="animate-spin inline-block w-4 h-4 mr-1" />
                Polling... ({countdown}s)
              </>
            ) : cooldownActive ? (
              "Cooldown..."
            ) : (
              <>
                <RotateCw className="inline-block w-4 h-4 mr-1" /> Retry
              </>
            )}
          </button>
        )}

        {file.status === "Converted" && (
          <>
            <button
              onClick={() => onPreview(file.url)}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Preview
            </button>
            <button
              onClick={() => onEdit(file.url)}
              className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}