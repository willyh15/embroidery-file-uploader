// components/StitchPreviewModal.js
import { useEffect, useRef, useState } from "react";
import isEqual from "lodash.isequal";

const FLASK_BASE = "https://embroideryfiles.duckdns.org";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const canvasRef = useRef(null);

  // state
  const [segments, setSegments] = useState([]);
  const [colors,   setColors]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [scale,    setScale]    = useState(1);
  const [offset,   setOffset]   = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // derive the base filename (no extension)
  const baseName = fileUrl?.split("/").pop()?.replace(/\.\w+$/, "");
  const pngUrl   = fileUrl;                                  // original upload
  const svgUrl   = baseName
    ? `${FLASK_BASE}/downloads/${baseName}.svg`
    : null;

  // 1) fetch the stitch‐segments JSON
  useEffect(() => {
    if (!baseName) return setSegments([]), setColors([]);
    fetch(`${FLASK_BASE}/api/preview-data/${baseName}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        if (!isEqual(d.segments, segments)) setSegments(d.segments);
        if (!isEqual(d.colors,   colors))   setColors(d.colors);
      })
      .catch((err) => console.error("[StitchPreviewModal]", err));
  }, [baseName]);

  // 2) auto‑fit whenever segments change
  useEffect(() => {
    if (!segments.length) return;
    const pts = segments.flat();
    const xs  = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = maxX - minX, h = maxY - minY;
    const C = canvasRef.current;
    const f = Math.min(C.width / w, C.height / h) * 0.9;
    setScale(f);
    setOffset({ x: 0, y: 0 });
    setSelected(null);
  }, [segments]);

  // 3) redraw canvas (transparent background)
  useEffect(() => {
    const C = canvasRef.current;
    if (!C || !segments.length) return;
    const ctx = C.getContext("2d");
    ctx.clearRect(0, 0, C.width, C.height);
    ctx.save();
    // center & flip Y
    const pts  = segments.flat();
    const xs   = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    ctx.translate(C.width/2, C.height/2);
    ctx.scale(scale, -scale);
    ctx.translate(-(minX + maxX)/2, -(minY + maxY)/2);
    // pan
    ctx.translate(offset.x/scale, offset.y/scale);

    segments.forEach((seg, i) => {
      ctx.beginPath();
      ctx.strokeStyle = selected === i ? "#000" : (colors[i] || "#888");
      ctx.lineWidth   = selected === i ? 2.5   : 1.2;
      seg.forEach(([x,y], idx) =>
        idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      );
      ctx.stroke();
    });
    ctx.restore();
  }, [segments, colors, scale, offset, selected]);

  // --- interactions ---
  const onWheel     = (e) => { e.preventDefault(); setScale(s => Math.max(0.1, s * (e.deltaY>0?0.9:1.1))); };
  const onMouseDown = (e) => { setDragging(true); dragStart.current = { x:e.clientX,y:e.clientY }; };
  const onMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x,
          dy = e.clientY - dragStart.current.y;
    setOffset(o => ({ x:o.x+dx, y:o.y+dy }));
    dragStart.current = { x:e.clientX, y:e.clientY };
  };
  const onMouseUp   = () => setDragging(false);
  const clickSeg    = (e) => {
    const C = canvasRef.current, rect = C.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    // map to stitch coords
    const pts  = segments.flat(),
          xs   = pts.map(p=>p[0]), ys = pts.map(p=>p[1]),
          minX = Math.min(...xs), maxX = Math.max(...xs),
          minY = Math.min(...ys), maxY = Math.max(...ys),
          midX = (minX+maxX)/2, midY = (minY+maxY)/2;
    const sx = (mx - C.width/2 - offset.x)/scale + midX;
    const sy = -((my - C.height/2 + offset.y)/scale) + midY;
    for (let i=0;i<segments.length;i++){
      if (segments[i].some(([x,y])=>Math.hypot(x-sx,y-sy) < 5/scale)){
        return setSelected(i);
      }
    }
    setSelected(null);
  };
  const exportPNG   = () => {
    const link = document.createElement("a");
    link.download = "stitch.png";
    link.href     = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 overflow-auto">

        <h3 className="text-2xl font-semibold mb-4 text-gray-800">
          Stitch Preview
        </h3>

        {/* 1) Original upload */}
        {pngUrl && (
          <div className="mb-4">
            <img
              src={pngUrl}
              alt="Original upload"
              className="w-full rounded border"
              style={{ backgroundColor: "transparent" }}
            />
          </div>
        )}

        {/* 2) Raw SVG */}
        {svgUrl && (
          <div className="mb-4">
            <img
              src={svgUrl}
              alt="Raw SVG"
              className="w-full rounded border"
              style={{ backgroundColor: "transparent" }}
            />
          </div>
        )}

        {/* 3) Canvas‐based stitch overlay */}
        <canvas
          ref={canvasRef}
          width={450}
          height={450}
          className="w-full border rounded mb-4 bg-transparent"
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onClick={clickSeg}
        />

        <div className="flex justify-between">
          <button
            onClick={exportPNG}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export PNG
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}