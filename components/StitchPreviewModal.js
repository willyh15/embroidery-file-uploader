// components/StitchPreviewModal.js
import { useEffect, useRef, useState } from "react";
import isEqual from "lodash.isequal";

// ← your real Flask base URL
const FLASK_BASE = "https://embroideryfiles.duckdns.org";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const canvasRef = useRef(null);

  const [segments, setSegments] = useState([]);
  const [colors, setColors]     = useState([]);
  const [selected, setSelected] = useState(null);

  // this is our dynamic "zoom" factor
  const [scale, setScale]       = useState(1);
  // pan offset
  const [offset, setOffset]     = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // 1) fetch preview-data
  useEffect(() => {
    if (!fileUrl) {
      setSegments([]);
      setColors([]);
      return;
    }
    const name = fileUrl.split("/").pop();
    const previewUrl = `${FLASK_BASE}/api/preview-data/${name}`;

    fetch(previewUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (!isEqual(data.segments, segments)) setSegments(data.segments);
        if (!isEqual(data.colors,   colors))   setColors(data.colors);
      })
      .catch((err) => console.error("[StitchPreviewModal] preview-data error:", err));
  }, [fileUrl]);

  // 2) once we have segments, auto‑fit them into the canvas
  useEffect(() => {
    if (!segments.length) return;
    const canvas = canvasRef.current;
    const pts    = segments.flat();
    const xs     = pts.map((p) => p[0]);
    const ys     = pts.map((p) => p[1]);
    const minX   = Math.min(...xs), maxX = Math.max(...xs);
    const minY   = Math.min(...ys), maxY = Math.max(...ys);

    // how big is the shape?
    const shapeW = maxX - minX;
    const shapeH = maxY - minY;

    // compute the scale that fits both dimensions
    const scaleX = canvas.width  / shapeW;
    const scaleY = canvas.height / shapeH;
    const fit    = Math.min(scaleX, scaleY) * 0.9;  // 90% of the canvas

    setScale(fit);
    setOffset({ x: 0, y: 0 });   // reset any pan
    setSelected(null);
  }, [segments]);

  // 3) draw everything
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !segments.length) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pts = segments.flat();
    const xs  = pts.map((p) => p[0]);
    const ys  = pts.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const shapeW = maxX - minX;
    const shapeH = maxY - minY;

    segments.forEach((seg, i) => {
      ctx.beginPath();
      ctx.strokeStyle = selected === i ? "#000" : (colors[i] || "#888");
      ctx.lineWidth   = selected === i ? 2.5   : 1.2;

      seg.forEach(([x, y], idx) => {
        // normalize coords so 0→minX..maxX→canvas width, similarly for y
        const px = (x - minX) * scale + (canvas.width  - shapeW*scale)/2 + offset.x;
        // invert Y so positive stitch-Y goes up
        const py = canvas.height - ((y - minY) * scale + (canvas.height - shapeH*scale)/2) + offset.y;

        if (idx === 0) ctx.moveTo(px, py);
        else           ctx.lineTo(px, py);
      });

      ctx.stroke();
    });
  }, [segments, colors, scale, offset, selected]);

  // wheel = zoom
  const onWheel = (e) => {
    e.preventDefault();
    setScale((s) => Math.max(0.1, s * (e.deltaY > 0 ? 0.9 : 1.1)));
  };

  // pan start
  const handleDown = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  // pan move
  const handleMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleUp = () => setDragging(false);

  // segment selection on click
  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;

    // find if any segment point is within 5px
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].some(([x, y]) => {
        const px = (x - Math.min(...segments.flat().map(p=>p[0]))) * scale
                   + (canvasRef.current.width - (Math.max(...segments.flat().map(p=>p[0])) - Math.min(...segments.flat().map(p=>p[0])))*scale)/2
                   + offset.x;
        const py = canvasRef.current.height - ((y - Math.min(...segments.flat().map(p=>p[1]))) * scale
                   + (canvasRef.current.height - (Math.max(...segments.flat().map(p=>p[1])) - Math.min(...segments.flat().map(p=>p[1])))*scale)/2)
                   + offset.y;
        return Math.hypot(px - mx, py - my) < 5;
      })) {
        setSelected(i);
        return;
      }
    }
    setSelected(null);
  };

  const exportPNG = () => {
    const link = document.createElement("a");
    link.download = "stitch.png";
    link.href     = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 overflow-auto">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Stitch Preview</h3>

        <canvas
          ref={canvasRef}
          width={450}
          height={450}
          className="w-full border rounded mb-4"
          onWheel={onWheel}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
          onClick={handleClick}
        />

        <div className="text-sm text-gray-600 mb-2">
          <strong>Zoom:</strong> Scroll &nbsp;|&nbsp; <strong>Pan:</strong> Drag &nbsp;|&nbsp; <strong>Select:</strong> Click
        </div>

        {segments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {colors.map((clr, i) => (
              <div key={i} className="flex items-center space-x-1 text-sm">
                <div
                  className={`w-5 h-5 rounded-full border-2 ${selected === i ? "ring-2 ring-black" : ""}`}
                  style={{ backgroundColor: clr }}
                />
                <span>Thread {i + 1}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={exportPNG}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export PNG
          </button>
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