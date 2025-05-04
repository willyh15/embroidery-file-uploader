// components/StitchEditorModal.jsx
import { useState } from "react";

export default function StitchEditorModal({ fileUrl, onClose }) {
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const handleAction = async (endpoint, successMsg, errorMsg) => {
    setLoading(true);
    setInfoMessage("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || errorMsg);
      setInfoMessage(data.message || successMsg);
    } catch (err) {
      console.error(err);
      setInfoMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-2">Stitch Editor</h2>
        <p className="text-sm text-gray-600 mb-4 truncate">File: {fileUrl}</p>

        {loading && (
          <p className="text-blue-500 mb-2">Processing…</p>
        )}
        {infoMessage && (
          <p className="text-gray-800 mb-4">{infoMessage}</p>
        )}

        {/* Visualization Placeholder */}
        <div className="border border-gray-300 rounded-lg p-4 mb-6">
          <p className="text-center text-gray-500">
            Placeholder for stitch visualization (SVG or Canvas)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() =>
              handleAction(
                "/api/stitch-increase-density",
                "Density increased!",
                "Failed to increase density."
              )
            }
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Increase Density
          </button>
          <button
            onClick={() =>
              handleAction(
                "/api/stitch-simplify",
                "Stitches simplified!",
                "Failed to simplify stitches."
              )
            }
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Simplify Stitches
          </button>
          <button
            onClick={() =>
              handleAction(
                "/api/stitch-optimize",
                "Stitches optimized!",
                "Failed to optimize stitches."
              )
            }
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Optimize
          </button>
        </div>

        {/* Tips & Info */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Tips & Info</h4>
          <p className="text-gray-700 text-sm">
            This section can provide guidance or logs about your stitch editing
            process. For example: “Density increased to X%,” etc.
          </p>
        </div>
      </div>
    </div>
  );
}