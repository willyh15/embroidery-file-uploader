import { useEffect, useState, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { XCircle } from "lucide-react";

export default function StitchPreviewModal({ file, onClose }) {
  const [svgContent, setSvgContent] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await fetch(`/api/preview?fileUrl=${encodeURIComponent(file.url)}`);
        const data = await res.json();
        setSvgContent(data.svg || "");
      } catch (err) {
        console.error("Failed to fetch preview:", err);
      }
    };
    fetchPreview();
  }, [file.url]);

  return (
    <Dialog open={!!file} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-4 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-red-600">
          <XCircle className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold mb-3">Stitch Preview: {file.name}</h2>

        <div
          ref={containerRef}
          className="border rounded shadow-inner overflow-scroll bg-gray-50 p-2 max-h-[70vh]"
          style={{ minHeight: "400px" }}
        >
          {svgContent ? (
            <div
              className="preview-svg w-full h-full"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <p>Loading preview...</p>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600 flex flex-wrap gap-4">
          <span>Hover over segments to inspect.</span>
          <span>Zoom with pinch/scroll. Pan by dragging.</span>
        </div>
      </div>
    </Dialog>
  );
}
