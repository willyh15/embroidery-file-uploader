import React, { useState, useEffect } from "react";
import { X, Droplet, Ruler, Pencil } from "lucide-react";

export default function StitchEditor({ fileUrl, onClose }) {
  const [threadColor, setThreadColor] = useState("#4F46E5");
  const [density, setDensity] = useState(1.0);
  const [vectorPaths, setVectorPaths] = useState([]);

  useEffect(() => {
    // Placeholder: Fetch stitch data (mock or real endpoint later)
    setVectorPaths([
      { id: 1, path: "M10 10L50 50", selected: false },
      { id: 2, path: "M20 30L80 90", selected: false }
    ]);
  }, [fileUrl]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Stitch Editor</h2>

        {/* Thread Color Selector */}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-1 text-sm text-gray-600">
            <Droplet className="w-4 h-4" /> Thread Color
          </label>
          <input
            type="color"
            value={threadColor}
            onChange={(e) => setThreadColor(e.target.value)}
            className="w-10 h-10 border rounded"
          />
        </div>

        {/* Stitch Density Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-1 text-sm text-gray-600">
            <Ruler className="w-4 h-4" /> Stitch Density
          </label>
          <input
            type="range"
            min={0.2}
            max={2.0}
            step={0.1}
            value={density}
            onChange={(e) => setDensity(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-right text-gray-500 mt-1">{density.toFixed(1)}x</div>
        </div>

        {/* Vector Path Display */}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-1 text-sm text-gray-600">
            <Pencil className="w-4 h-4" /> Stitch Paths (readonly for now)
          </label>
          <div className="h-48 border rounded bg-gray-50 overflow-auto p-2 text-sm">
            {vectorPaths.map((path) => (
              <div key={path.id} className="text-gray-800 mb-1">
                {path.path}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
            onClick={() => alert("Apply edits: coming soon")}
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
