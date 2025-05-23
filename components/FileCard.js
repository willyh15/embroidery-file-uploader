// components/FileCard.js
import {
  Loader2,
  RotateCw,
  CheckCircle,
  XCircle,
  ArrowDownCircle,
  Sparkles,
  Eye,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function FileCard({ file, onConvert, onDownload, onPreview, onEdit }) {
  const [retrying, setRetrying] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const cardRef = useRef(null);

  // mark “new” for 10s
  useEffect(() => {
    const t = setTimeout(() => setIsNew(false), 10_000);
    return () => clearTimeout(t);
  }, []);

  // countdown timer
  useEffect(() => {
    if (!retrying || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1_000);
    return () => clearTimeout(t);
  }, [retrying, countdown]);

  const handleRetry = async () => {
    setRetrying(true);
    setCountdown(3);

    try {
      await onConvert(file.url);
      toast.success("Retry started!");

      setTimeout(() => {
        const el = cardRef.current;
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.classList.add("ring-4", "ring-green-400", "animate-bounce");
        setTimeout(
          () => el?.classList.remove("ring-4", "ring-green-400", "animate-bounce"),
          3_000
        );
      }, 100);

      setTimeout(() => {
        setRetrying(false);
        setCooldownActive(true);
        setTimeout(() => setCooldownActive(false), 5_000);
      }, 3_000);
    } catch (err) {
      console.error(err);
      toast.error("Retry failed.");

      const el = cardRef.current;
      el?.classList.add("ring-4", "ring-red-400", "animate-pulse");
      setTimeout(() => el?.classList.remove("ring-4", "ring-red-400", "animate-pulse"), 2_000);
      setRetrying(false);
    }
  };

  const getStageColor = (stage) =>
    ({
      uploading: "bg-blue-300",
      downloading: "bg-blue-500",
      resizing: "bg-yellow-500",
      vectorizing: "bg-orange-500",
      "converting-pes": "bg-purple-500",
      done: "bg-green-600",
      failed: "bg-red-600",
      error: "bg-red-600",
    }[stage] || "bg-gray-400");

  const renderIcon = () => {
    if (file.status === "Uploading" || file.status === "Converting") {
      return <Loader2 className="animate-spin text-blue-500 w-5 h-5" />;
    }
    if (file.status === "Converted") {
      return <CheckCircle className="text-green-500 w-5 h-5" />;
    }
    if (file.status === "Error") {
      return <XCircle className="text-red-500 w-5 h-5" />;
    }
    return null;
  };

  return (
    <div
      ref={cardRef}
      data-file-url={file.url}
      className={`glass-modal p-4 mb-6 ${retrying ? "ring-4 ring-blue-400 animate-pulse" : ""}`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <strong className="truncate">{file.name}</strong>
          {isNew && (
            <span className="flex items-center space-x-1 px-2 py-0.5 bg-[var(--accent)] text-[var(--primary-bg)] rounded-full text-xs animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>NEW</span>
            </span>
          )}
          {renderIcon()}
        </div>
        <span className="text-sm text-[var(--primary-text)]">{file.status}</span>
      </div>

      {file.stage && (
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-2 ${getStageColor(file.stage)} transition-all duration-700 ease-in-out`}
            style={{ width: "100%" }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {file.uploadProgress != null && file.status === "Uploading" && (
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            Uploading {file.uploadProgress}%
          </span>
        )}

        {file.status === "Uploaded" && (
          <button
            onClick={() => onConvert(file.url)}
            className="btn btn-primary flex items-center space-x-1 text-sm"
          >
            <RotateCw className="w-4 h-4" />
            <span>Convert</span>
          </button>
        )}

        {file.status === "Converting" && (
          <span className="text-sm text-blue-500">Converting…</span>
        )}

        {file.status === "Converted" && file.pesUrl && (
          <>
            <a
              href={file.pesUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onDownload(file.url, "pes")}
              className="btn btn-accent flex items-center space-x-1 text-sm"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Download PES</span>
            </a>
            <button
              onClick={() => onPreview(file.pesUrl)}
              className="btn btn-outline flex items-center space-x-1 text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => onEdit(file.url)}
              className="btn btn-accent flex items-center space-x-1 text-sm"
            >
              <span>Edit</span>
            </button>
          </>
        )}

        {file.status === "Error" && (
          <button
            onClick={handleRetry}
            disabled={retrying || cooldownActive}
            className={`btn btn-danger flex items-center space-x-1 text-sm ${
              retrying || cooldownActive ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {retrying ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Retrying… ({countdown}s)</span>
              </>
            ) : cooldownActive ? (
              <span>Cooldown…</span>
            ) : (
              <>
                <RotateCw className="w-4 h-4" />
                <span>Retry</span>
              </>
            )}
          </button>
        )}
      </div>

      {file.status === "Converted" && (
        <div className="text-xs text-gray-400">
          <strong>Debug Info:</strong> pesUrl: {file.pesUrl || "N/A"}
          {!file.pesUrl && (
            <div className="text-red-500 font-semibold mt-1">
              [Missing pesUrl despite Converted status]
            </div>
          )}
        </div>
      )}
    </div>
  );
}