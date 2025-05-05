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

  // 1) fetch & store segments/colors
  useEffect(() => {
    if (!fileUrl) return setSegments([]) & setColors([]);
    const name = fileUrl.split("/").pop();
    fetch(`${FLASK_BASE}/api/preview-data/${name}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        if (!isEqual(data.segments, segments)) setSegments(data.segments);
        if (!isEqual(data.colors,   colors))   setColors(data.colors);
      })
      .catch(console.error);
  }, [fileUrl]);

  // 2) auto‑fit whenever segments change
  useEffect(() => {
    if (!segments.length) return;
    const pts   = segments.flat();
    const xs    = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX  = Math.min(...xs),  maxX = Math.max(...xs);
    const minY  = Math.min(...ys),  maxY = Math.max(...ys);
    const w     = maxX - minX,      h    = maxY - minY;
    const C    = canvasRef.current;
    const sx    = C.width  / w;
    const sy    = C.height / h;
    const f     = Math.min(sx, sy) * 0.9;       // 90% fill
    setScale(f);
    setOffset({ x: 0, y: 0 });
    setSelected(null);
  }, [segments]);

  // 3) redraw on any change
  useEffect(() => {
    const C = canvasRef.current;
    if (!C || !segments.length) return;
    const ctx = C.getContext("2d");
    ctx.clearRect(0, 0, C.width, C.height);

    // recompute mins for centering
    const pts   = segments.flat();
    const xs    = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX  = Math.min(...xs),  maxX = Math.max(...xs);
    const minY  = Math.min(...ys),  maxY = Math.max(...ys);
    const w     = maxX - minX,      h    = maxY - minY;

    segments.forEach((seg, i) => {
      ctx.beginPath();
      ctx.strokeStyle = selected === i ? "#000" : (colors[i] || "#888");
      ctx.lineWidth   = selected === i ? 2.5   : 1.2;

      seg.forEach(([x,y], idx) => {
        // map normalized → canvas coords, invert Y
        const px = (x - minX)*scale + (C.width - w*scale)/2 + offset.x;
        const py = C.height - ((y - minY)*scale + (C.height - h*scale)/2) + offset.y;
        idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.stroke();
    });
  }, [segments, colors, scale, offset, selected]);

  // wheel zoom
  const onWheel = e => {
    e.preventDefault();
    setScale(s => Math.max(0.1, s * (e.deltaY>0 ? 0.9 : 1.1)));
  };
  // pan handlers
  const down = e => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };
  const move = e => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(o => ({ x: o.x+dx, y: o.y+dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };
  const up = () => setDragging(false);

  // click to select a segment
  const clickSeg = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].some(([x,y]) => {
        const px = (x - Math.min(...segments.flat().map(p=>p[0])))*scale
                   + (canvasRef.current.width - (Math.max(...segments.flat().map(p=>p[0])) - Math.min(...segments.flat().map(p=>p[0])))*scale)/2
                   + offset.x;
        const py = canvasRef.current.height - ((y - Math.min(...segments.flat().map(p=>p[1])))*scale
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
                  className={`w-5 h-5 rounded-full border-2 ${selected===i?"ring-2 ring-black":""}`}
                  style={{ backgroundColor: clr }}
                />
                <span>Thread {i+1}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={exportPNG}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >Export PNG</button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >Close</button>
        </div>
      </div>
    </div>
  );
}