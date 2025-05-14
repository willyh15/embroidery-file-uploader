// components/StitchPreviewModal.js
import { useEffect, useState } from "react";

const FLASK_BASE = "https://embroideryfiles.duckdns.org";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const [svgUrl, setSvgUrl] = useState(null);

  // Whenever fileUrl changes, swap its extension to .svg
  useEffect(() => {
    if (!fileUrl) {
      setSvgUrl(null);
      return;
    }
    const baseName = fileUrl.split("/").pop().replace(/\.\w+$/, ".svg");
    setSvgUrl(`${FLASK_BASE}/downloads/${baseName}`);
  }, [fileUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 overflow-auto">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">
          SVG Preview
        </h3>

        {svgUrl ? (
          <object
            type="image/svg+xml"
            data={svgUrl}
            className="w-full h-auto border rounded mb-4"
            style={{ minHeight: 300 }}
          >
            {/* fallback for browsers that don’t support <object> */}
            <img
              src={svgUrl}
              alt="SVG preview"
              className="w-full h-auto"
            />
          </object>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No file selected.
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}