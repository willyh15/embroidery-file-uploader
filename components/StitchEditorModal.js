// components/StitchEditorModal.js
import { useState } from "react";
import toast from "react-hot-toast";

export default function StitchEditorModal({ fileUrl, onClose }) {
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  // extra state for “Fill” endpoint
  const [fillType, setFillType] = useState("zigzag");
  const [fillSpacing, setFillSpacing] = useState(1.0);

  const performRequest = async (endpoint, body, successMsg, errorMsg) => {
    setLoading(true);
    setInfoMessage("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || errorMsg);
      setInfoMessage(data.message || successMsg);
      if (data.pesUrl) {
        toast.success(successMsg);
      }
    } catch (err) {
      console.error(err);
      setInfoMessage(errorMsg);
      toast.error(errorMsg);
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

        {loading && <p className="text-blue-500 mb-2">Processing…</p>}
        {infoMessage && (
          <p className="text-gray-800 mb-4">{infoMessage}</p>
        )}

        {/* Visualization Placeholder */}
        <div className="border border-gray-300 rounded-lg p-4 mb-6">
          <p className="text-center text-gray-500">
            (Preview of SVG / Canvas editor would go here)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() =>
              performRequest(
                "/api/stitch-increase-density",
                { fileUrl },
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
              performRequest(
                "/api/stitch-simplify",
                { fileUrl },
                "Stitches simplified!",
                "Failed to simplify stitches."
              )
            }
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Simplify Paths
          </button>

          <button
            onClick={() =>
              performRequest(
                "/api/stitch-optimize",
                { fileUrl },
                "Stitches optimized!",
                "Failed to optimize stitches."
              )
            }
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Optimize Order
          </button>
        </div>

        {/* Fill & Trim Controls */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-2">Fill & Trim</h4>

          {/* Fill controls */}
          <div className="flex items-center space-x-2 mb-4">
            <label className="text-sm">Fill Type:</label>
            <select
              value={fillType}
              onChange={(e) => setFillType(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="zigzag">Zig-zag</option>
              <option value="tatami">Tatami</option>
            </select>

            <label className="text-sm">Spacing:</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={fillSpacing}
              onChange={(e) => setFillSpacing(parseFloat(e.target.value))}
              className="w-16 border rounded px-2 py-1 text-sm"
            />

            <button
              onClick={() =>
                performRequest(
                  "/api/stitch-fill",
                  { fileUrl, fillType, fillSpacing },
                  `${fillType.charAt(0).toUpperCase() + fillType.slice(1)} fill applied!`,
                  "Failed to apply fill."
                )
              }
              disabled={loading}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
            >
              Apply Fill
            </button>
          </div>

          {/* Trim button */}
          <button
            onClick={() =>
              performRequest(
                "/api/stitch-trim",
                { fileUrl },
                "Edge trim applied!",
                "Failed to trim edges."
              )
            }
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm"
          >
            Trim Edges
          </button>
        </div>

        {/* Tips & Info */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Tips & Info</h4>
          <p className="text-gray-700 text-sm">
            Use “Increase Density” to pack more stitches, “Simplify Paths” to decimate vector noise,<br/>
            “Optimize Order” to minimize jump stitches,<br/>
            “Apply Fill” to switch between zig-zag or tatami patterns,<br/>
            and “Trim Edges” to remove stray jump tails.
          </p>
        </div>
      </div>
    </div>
  );
}