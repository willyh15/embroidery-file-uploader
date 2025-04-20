import { Loader2, RotateCw, CheckCircle, XCircle, ArrowDownCircle, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function FileCard({ file, onConvert, onDownload, onPreview, onEdit }) {
  const [retrying, setRetrying] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 10000);
    return () => clearTimeout(timer);
  }, []);

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
        const card = document.querySelector(`[data-file-url="${file.url}"]`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.classList.add("ring-4", "ring-green-400", "animate-bounce");
          setTimeout(() => card.classList.remove("ring-4", "ring-green-400", "animate-bounce"), 3000);
        }
      }, 100);

      setTimeout(() => {
        setRetrying(false);
        setCooldownActive(true);
        setTimeout(() => setCooldownActive(false), 5000);
      }, 3000);

    } catch (err) {
      console.error("[Retry Error]", err);
      toast.error("Retry failed.");

      const card = document.querySelector(`[data-file-url="${file.url}"]`);
      if (card) {
        card.classList.add("ring-4", "ring-red-400", "animate-pulse");
        setTimeout(() => card.classList.remove("ring-4", "ring-red-400", "animate-pulse"), 2000);
      }
      setRetrying(false);
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "uploading": return "bg-blue-300";
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
    if (file.status === "Uploading") return <Loader2 className="animate-spin text-blue-400 w-5 h-5" />;
    if (file.status === "Converting") return <Loader2 className="animate-spin text-blue-500 w-5 h-5" />;
    if (file.status === "Converted") return <CheckCircle className="text-green-500 w-5 h-5" />;
    if (file.status === "Error") return <XCircle className="text-red-500 w-5 h-5" />;
    return null;
  };

  return (
    <div
      ref={cardRef}
      data-file-url={file.url}
      className={`bg-white shadow rounded p-4 mb-4 border border-gray-200 transition-all duration-500 ${
        retrying ? "ring-2 ring-blue-400 animate-pulse" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <strong className="truncate max-w-[250px]">{file.name}</strong>
          {isNew && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-green-200 text-green-800 rounded-full animate-fade-in">
              <Sparkles className="w-3 h-3 mr-1 inline" /> NEW
            </span>
          )}
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
        {file.uploadProgress !== undefined && file.status === "Uploading" && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs animate-pulse">
            Uploading {file.uploadProgress}%
          </span>
        )}

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