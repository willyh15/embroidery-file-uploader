// components/StitchPreviewModal.js
import { useEffect, useRef, useState } from "react";
import isEqual from "lodash.isequal";

const FLASK_BASE = "https://embroideryfiles.duckdns.org";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const canvasRef = useRef(null);
  const [segments, setSegments] = useState([]);
  const [colors, setColors]     = useState([]);
  const [selected, setSelected] = useState(null);
  const [scale, setScale]       = useState(1);
  const [offset, setOffset]     = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // 1) Fetch segments/colors JSON
  useEffect(() => {
    if (!fileUrl) {
      setSegments([]);
      setColors([]);
      return;
    }
    const name = fileUrl.split("/").pop();
    fetch(`${FLASK_BASE}/api/preview-data/${name}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        if (!isEqual(d.segments, segments)) setSegments(d.segments);
        if (!isEqual(d.colors,   colors))   setColors(d.colors);
      })
      .catch(console.error);
  }, [fileUrl]);

  // 2) Auto‑fit whenever segments change
  useEffect(() => {
    if (!segments.length) return;
    const pts   = segments.flat();
    const xs    = pts.map((p) => p[0]);
    const ys    = pts.map((p) => p[1]);
    const minX  = Math.min(...xs),  maxX = Math.max(...xs);
    const minY  = Math.min(...ys),  maxY = Math.max(...ys);
    const w     = maxX - minX;
    const h     = maxY - minY;
    const C     = canvasRef.current;
    const f     = Math.min(C.width / w, C.height / h) * 0.9; // 90% fill
    setScale(f);
    setOffset({ x: 0, y: 0 });
    setSelected(null);
  }, [segments]);

  // 3) Draw on the canvas
  useEffect(() => {
    const C = canvasRef.current;
    if (!C || !segments.length) return;
    const ctx = C.getContext("2d");
    ctx.clearRect(0, 0, C.width, C.height);

    // Compute global bounding box
    const pts  = segments.flat();
    const xs   = pts.map((p) => p[0]);
    const ys   = pts.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);

    // Set up transform: center, invert Y, scale to fit
    ctx.save();
    ctx.translate(C.width / 2, C.height / 2);
    ctx.scale(scale, -scale);
    ctx.translate(-(minX + maxX) / 2, -(minY + maxY) / 2);
    ctx.translate(offset.x / scale, offset.y / scale);

    // Draw each segment
    segments.forEach((seg, i) => {
      ctx.beginPath();
      ctx.strokeStyle = selected === i ? "#000" : (colors[i] || "#888");
      ctx.lineWidth   = selected === i ? 2.5   : 1.2;
      seg.forEach(([x, y], idx) =>
        idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      );
      ctx.stroke();
    });

    ctx.restore();
  }, [segments, colors, scale, offset, selected]);

  // Wheel = zoom
  const onWheel = (e) => {
    e.preventDefault();
    setScale((s) => Math.max(0.1, s * (e.deltaY > 0 ? 0.9 : 1.1)));
  };

  // Pan handlers
  const down = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };
  const move = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };
  const up = () => setDragging(false);

  // Click to select a segment
  const clickSeg = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].some(([x, y]) => {
        // transform stitch‐coords → screen px
        const px = ((x - (minX = Math.min(...segments.flat().map(p=>p[0])))) * scale)
                   + (C = canvasRef.current).width/2 - ((maxX = Math.max(...segments.flat().map(p=>p[0])))-minX)*scale/2 + offset.x;
        const py = C.height - (
                   ((y - (minY = Math.min(...segments.flat().map(p=>p[1])))) * scale)
                   + C.height/2 - ((maxY = Math.max(...segments.flat().map(p=>p[1])))-minY)*scale/2 - offset.y
                 );
        return Math.hypot(px - mx, py - my) < 5;
      })) {
        setSelected(i);
        return;
      }
    }
    setSelected(null);
  };

  // Export snapshot
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
          onMouseDown={down}
          onMouseMove={move}
          onMouseUp={up}
          onMouseLeave={up}
          onClick={clickSeg}
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