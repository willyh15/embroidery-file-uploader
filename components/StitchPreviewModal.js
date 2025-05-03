import { useEffect, useRef, useState } from "react";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const [segments, setSegments] = useState([]);
  const [colors, setColors] = useState([]);
  const canvasRef = useRef(null);

  // Zoom & pan state
  const [scale, setScale] = useState(5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Load stitch data
  useEffect(() => {
    if (!fileUrl) return;

    const filename = fileUrl.split("/").pop();
    fetch(`https://embroideryfiles.duckdns.org/api/preview-data/${filename}`)
      .then(res => res.json())
      .then(data => {
        if (data?.segments) {
          setSegments(data.segments);
          setColors(data.colors || []);
        }
      });
  }, [fileUrl]);

  // Draw
  useEffect(() => {
    if (!canvasRef.current || segments.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const allPoints = segments.flat();
    const xs = allPoints.map(p => p[0]);
    const ys = allPoints.map(p => p[1]);

    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const baseOffsetX = centerX - ((minX + maxX) / 2) * scale;
    const baseOffsetY = centerY - ((minY + maxY) / 2) * scale;

    segments.forEach((segment, i) => {
      ctx.strokeStyle = colors[i] || `hsl(${(i * 60) % 360}, 70%, 50%)`;
      ctx.beginPath();
      segment.forEach(([x, y], idx) => {
        const px = x * scale + baseOffsetX + offset.x;
        const py = y * scale + baseOffsetY + offset.y;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    });
  }, [segments, colors, scale, offset]);

  // Zoom scroll
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    setScale(prev => Math.max(1, prev + delta));
  };

  // Mouse drag for pan
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="modal fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-xl w-full">
        <h3 className="text-lg font-bold mb-4">Stitch Preview</h3>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border shadow"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <div className="text-sm mt-4">
          <strong>Zoom:</strong> Scroll | <strong>Pan:</strong> Drag | <strong>Colors:</strong>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {colors.map((color, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
              <span>Thread {idx + 1}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}