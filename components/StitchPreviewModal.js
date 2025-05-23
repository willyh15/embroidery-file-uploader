// components/StitchPreviewModal.js
import { useEffect, useRef, useState } from "react";
import isEqual from "lodash.isequal";

const FLASK_BASE = "https://embroideryfiles.duckdns.org";

export default function StitchPreviewModal({
  pngUrl,      // URL to the original PNG (uploads)
  pesUrl,      // URL to the .pes (downloads)
  onClose,
  onReconvert  // called when bg-removal flags change
}) {
  const canvasRef = useRef(null);

  // stitch-preview data
  const [segments, setSegments] = useState([]);
  const [colors, setColors]     = useState([]);
  const [selected, setSelected] = useState(null);

  // pan & zoom state
  const [scale, setScale]       = useState(1);
  const [offset, setOffset]     = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // background-removal controls
  const [removeBg, setRemoveBg]       = useState(false);
  const [bgThreshold, setBgThreshold] = useState(250);

  // derive baseName from pesUrl
  const baseName = pesUrl?.split("/").pop()?.replace(/\.pes$/, "");

  // 1) fetch stitch data whenever pesUrl changes
  useEffect(() => {
    if (!pesUrl) {
      setSegments([]);
      setColors([]);
      return;
    }
    fetch(`${FLASK_BASE}/api/preview-data/${baseName}.pes`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        if (!isEqual(d.segments, segments)) setSegments(d.segments);
        if (!isEqual(d.colors,   colors))   setColors(d.colors);
      })
      .catch(err => console.error("[StitchPreviewModal] fetch error:", err));
  }, [pesUrl, baseName]);

  // 1.b) trigger a re-convert upstream when bg settings change
  useEffect(() => {
    if (pesUrl && onReconvert) {
      onReconvert(pngUrl, { removeBg, bgThreshold });
    }
  }, [removeBg, bgThreshold]);

  // 2) auto-fit on new segments
  useEffect(() => {
    if (!segments.length) return;
    const pts = segments.flat();
    const xs  = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = maxX - minX, h = maxY - minY;
    const C = canvasRef.current;
    const f = Math.min(C.width / w, C.height / h) * 0.9;
    setScale(f);
    setOffset({ x: 0, y: 0 });
    setSelected(null);
  }, [segments]);

  // 3) redraw canvas: checkerboard → raw PNG → stitches
  useEffect(() => {
    const C = canvasRef.current;
    if (!C) return;
    const ctx = C.getContext("2d");

    // clear so checkerboard shows through
    ctx.clearRect(0, 0, C.width, C.height);

    // draw raw PNG underlay
    if (pngUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = pngUrl;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, C.width, C.height);
        drawStitches();
      };
    } else {
      drawStitches();
    }

    function drawStitches() {
      if (!segments.length) return;
      ctx.save();
      ctx.globalAlpha = 0.8;

      // center & flip Y → pan/zoom
      const pts  = segments.flat();
      const xs   = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);

      ctx.translate(C.width/2, C.height/2);
      ctx.scale(scale, -scale);
      ctx.translate(-(minX + maxX)/2, -(minY + maxY)/2);
      ctx.translate(offset.x/scale, offset.y/scale);

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
      ctx.globalAlpha = 1;
    }
  }, [pngUrl, pesUrl, segments, colors, scale, offset, selected]);

  // interactions
  const onWheel     = e => { e.preventDefault(); setScale(s => Math.max(0.1, s * (e.deltaY>0 ? 0.9 : 1.1))); };
  const onMouseDown = e => { setDragging(true); dragStart.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = e => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp   = () => setDragging(false);
  const clickSeg    = e => {
    const C = canvasRef.current, rect = C.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const pts = segments.flat();
    const xs  = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const midX = (minX + maxX)/2, midY = (minY + maxY)/2;
    const sx = (mx - C.width/2 - offset.x)/scale + midX;
    const sy = -((my - C.height/2 + offset.y)/scale) + midY;

    for (let i = 0; i < segments.length; i++) {
      if (segments[i].some(([x,y]) => Math.hypot(x-sx, y-sy) < 5/scale)) {
        setSelected(i);
        return;
      }
    }
    setSelected(null);
  };

  // export current view as PNG
  const exportPNG = () => {
    const link = document.createElement("a");
    link.download = "stitch-preview.png";
    link.href     = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 overflow-auto">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">
          Stitch Preview
        </h3>

        {/* BG-REMOVAL CONTROLS */}
        <div className="flex items-center space-x-6 mb-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={removeBg}
              onChange={e => setRemoveBg(e.target.checked)}
              className="form-checkbox"
            />
            <span>Strip white background</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <span>Threshold:</span>
            <input
              type="number"
              value={bgThreshold}
              onChange={e => setBgThreshold(+e.target.value)}
              className="w-16 border rounded px-1 py-0.5 text-sm"
            />
          </label>
        </div>

        {/* CANVAS */}
        <canvas
          ref={canvasRef}
          width={450}
          height={450}
          className="w-full rounded mb-4 border"
          style={{
            backgroundImage: "repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%)",
            backgroundSize:  "16px 16px",
          }}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onClick={clickSeg}
        />

        <div className="text-sm text-gray-600 mb-4">
          <strong>Zoom:</strong> Scroll&nbsp;|&nbsp;
          <strong>Pan:</strong> Drag&nbsp;|&nbsp;
          <strong>Select:</strong> Click
        </div>

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