import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, Palette, SlidersHorizontal } from "lucide-react";

export default function StitchEditor({ fileUrl, onClose }) {
  const [threadColor, setThreadColor] = useState("#000000");
  const [density, setDensity] = useState(1);
  const [vectorPaths, setVectorPaths] = useState([]);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await fetch(`/api/vector-paths?fileUrl=${encodeURIComponent(fileUrl)}`);
        const data = await res.json();
        if (res.ok) setVectorPaths(data.paths || []);
      } catch (err) {
        console.error("Failed to fetch paths", err);
      }
    };
    fetchPaths();
  }, [fileUrl]);

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

      <div className="bg-white w-full max-w-4xl p-6 rounded-lg z-50 relative shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X className="w-5 h-5" />
        </button>

        <Dialog.Title className="text-xl font-semibold mb-4">Stitch Editor</Dialog.Title>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">Thread Color</label>
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gray-500" />
              <input
                type="color"
                value={threadColor}
                onChange={(e) => setThreadColor(e.target.value)}
                className="w-12 h-8 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Stitch Density</label>
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <input
                type="range"
                min={0.2}
                max={2.0}
                step={0.1}
                value={density}
                onChange={(e) => setDensity(parseFloat(e.target.value))}
              />
              <span className="text-sm text-gray-600">{density.toFixed(1)}x</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Vector Paths</h3>
          <div className="max-h-48 overflow-auto border rounded p-3 text-sm text-gray-700 bg-gray-50">
            {vectorPaths.length > 0 ? (
              vectorPaths.map((path, i) => (
                <pre key={i} className="mb-2 whitespace-pre-wrap break-words">
                  {JSON.stringify(path, null, 2)}
                </pre>
              ))
            ) : (
              <div className="text-gray-500">Loading or no paths found.</div>
            )}
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={() => {
              console.log("Save action with:", threadColor, density);
              onClose();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Dialog>
  );
}
