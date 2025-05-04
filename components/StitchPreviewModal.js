// components/StitchPreviewModal.js
import { useEffect, useRef, useState } from "react";
import isEqual from "lodash.isequal";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const [segments, setSegments] = useState([]);
  const [colors, setColors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [scale, setScale] = useState(5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);

    useEffect(() => {
    if (!fileUrl) return;
    const name = fileUrl.split("/").pop();
    const previewUrl = `/api/preview-data/${name}`;

    console.log("[StitchPreviewModal] fetching preview data from:", previewUrl);
    fetch(previewUrl)
      .then((r) => {
        console.log("[StitchPreviewModal] raw response:", r.status, r);
        return r.json();
      })
      .then((d) => {
        console.log("[StitchPreviewModal] json payload:", d);
        if (d.error) throw new Error(d.error);
        if (!isEqual(d.segments, segments)) setSegments(d.segments);
        if (!isEqual(d.colors,   colors))   setColors(d.colors);
      })
      .catch((err) => {
        console.error("[StitchPreviewModal] failed to load preview‐data:", err);
      });
  }, [fileUrl]);

  // Draw segments on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !segments.length) return;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pts = segments.flat();
    if (!pts.length) return;
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const baseX = canvas.width / 2 - ((minX + maxX) / 2) * scale + offset.x;
    const baseY = canvas.height / 2 - ((minY + maxY) / 2) * scale + offset.y;

    segments.forEach((seg, i) => {
      ctx.strokeStyle = selected === i ? "#000" : colors[i] || "#888";
      ctx.lineWidth = selected === i ? 2.5 : 1.2;
      ctx.beginPath();
      seg.forEach(([x, y], idx) => {
        const px = x * scale + baseX;
        const py = y * scale + baseY;
        idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.stroke();
    });
  }, [segments, colors, scale, offset, selected]);

  // Handlers for zoom, pan, select
  const onWheel = (e) => {
    e.preventDefault();
    setScale((s) => Math.max(1, s + (e.deltaY > 0 ? -1 : 1)));
  };
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

  const clickSeg = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].some(([x, y]) => {
        const px = x * scale + rect.width/2 - ((Math.min(...segments.flat().map(p=>p[0])) + Math.max(...segments.flat().map(p=>p[0])))/2)*scale + offset.x;
        const py = y * scale + rect.height/2 - ((Math.min(...segments.flat().map(p=>p[1])) + Math.max(...segments.flat().map(p=>p[1])))/2)*scale + offset.y;
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
    link.href = canvasRef.current.toDataURL("image/png");
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