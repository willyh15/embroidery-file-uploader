import { useEffect, useRef, useState } from "react";
import isEqual from "lodash.isequal";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const [segments, setSegments] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const canvasRef = useRef(null);
  const [scale, setScale] = useState(5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!fileUrl) return;
    const filename = fileUrl.split("/").pop();
    fetch(`https://embroideryfiles.duckdns.org/api/preview-data/${filename}`)
      .then((res) => res.json())
      .then((data) => {
        // Log minimal info to avoid circular structure issues
        console.log(
          "[Preview API Response] segments:",
          data?.segments ? data.segments.length : 0,
          "colors:",
          data?.colors ? data.colors.length : 0
        );
        if (data?.segments && !isEqual(data.segments, segments)) {
          setSegments(data.segments);
        }
        if (data?.colors && !isEqual(data.colors, colors)) {
          setColors(data.colors);
        }
      })
      .catch((err) => {
        console.error("[Preview Fetch Error]", err);
      });
  }, [fileUrl]);

  useEffect(() => {
    if (!canvasRef.current || segments.length === 0) {
      console.log("Canvas not ready or no segments available");
      return;
    }
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      // Reset transforms
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Flatten segments and check if there are points
      const allPoints = segments.flat();
      if (allPoints.length === 0) {
        console.warn("No points found in segments");
        return;
      }

      // Calculate bounding box
      const xs = allPoints.map((p) => p[0]);
      const ys = allPoints.map((p) => p[1]);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseOffsetX = centerX - ((minX + maxX) / 2) * scale;
      const baseOffsetY = centerY - ((minY + maxY) / 2) * scale;

      console.log("Canvas dimensions:", canvas.width, canvas.height);
      console.log("Bounding box:", { minX, minY, maxX, maxY });
      console.log("Base offset:", { baseOffsetX, baseOffsetY });

      segments.forEach((segment, i) => {
        ctx.strokeStyle =
          selectedIndex === i ? "black" : colors[i] || `hsl(${(i * 60) % 360}, 70%, 50%)`;
        ctx.lineWidth = selectedIndex === i ? 2.5 : 1.2;

        ctx.beginPath();
        segment.forEach(([x, y], idx) => {
          const px = x * scale + baseOffsetX + offset.x;
          const py = y * scale + baseOffsetY + offset.y;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      });
    } catch (error) {
      console.error("[Canvas Draw Error]", error);
    }
  }, [segments, colors, scale, offset, selectedIndex]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    setScale((prev) => Math.max(1, prev + delta));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const allPoints = segments.flat();
    if (allPoints.length === 0) return;
    const xs = allPoints.map((p) => p[0]);
    const ys = allPoints.map((p) => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseOffsetX = centerX - ((minX + maxX) / 2) * scale;
    const baseOffsetY = centerY - ((minY + maxY) / 2) * scale;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      for (let [x, y] of seg) {
        const px = x * scale + baseOffsetX + offset.x;
        const py = y * scale + baseOffsetY + offset.y;
        if (Math.abs(px - mouseX) < 5 && Math.abs(py - mouseY) < 5) {
          setSelectedIndex(i);
          return;
        }
      }
    }
    setSelectedIndex(null);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "stitch-preview.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-xl w-full">
        <h3 className="text-lg font-bold mb-4">Stitch Preview</h3>
        <canvas
          ref={canvasRef}
          width={450}
          height={450}
          className="border shadow"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
        />
        <div className="text-sm mt-4">
          <strong>Zoom:</strong> Scroll | <strong>Pan:</strong> Drag | <strong>Select:</strong> Click segment
        </div>
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {colors.map((color, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs">
                <div
                  className={`w-4 h-4 rounded-full border ${
                    selectedIndex === idx ? "ring-2 ring-black" : ""
                  }`}
                  style={{ backgroundColor: color }}
                ></div>
                <span>Thread {idx + 1}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export PNG
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}