// components/StitchEditor.js
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function StitchEditor({ fileUrl, onClose }) {
  const canvasRef = useRef(null);
  const [svg, setSvg] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [dragOff, setDragOff] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const wsRef = useRef(null);

  // fetch initial SVG
  useEffect(() => {
    fetch(`/api/vector-data?fileUrl=${encodeURIComponent(fileUrl)}`)
      .then((r) => r.json())
      .then((d) => setSvg(d.svg))
      .catch(console.error);
  }, [fileUrl]);

  // websocket setup
  useEffect(() => {
    const ws = new WebSocket(`wss://${window.location.host}/ws/edit`);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "vector-update" && msg.fileUrl === fileUrl) {
        setSvg(msg.svg);
      }
    };
    wsRef.current = ws;
    return () => ws.close();
  }, [fileUrl]);

  // draw
  useEffect(() => {
    const cnv = canvasRef.current;
    if (!cnv || !svg) return;
    const ctx = cnv.getContext("2d");
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const paths = doc.querySelectorAll("path");
    paths.forEach((p, i) => {
      const d = p.getAttribute("d");
      const path2d = new Path2D(d);
      ctx.strokeStyle = i === selectedIdx ? "red" : "black";
      ctx.lineWidth = 2;
      ctx.stroke(path2d);
    });
  }, [svg, selectedIdx]);

  // rudimentary drag-selection
  const down = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    setSelectedIdx(0); // always pick first for now
    setDragOff({ x, y });
    setDragging(true);
  };
  const move = (e) => {
    if (!dragging || selectedIdx == null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const dx = x - dragOff.x, dy = y - dragOff.y;
    setDragOff({ x, y });

    // update svg transform
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const paths = doc.querySelectorAll("path");
    const p = paths[selectedIdx];
    p.setAttribute("transform", `translate(${dx},${dy})`);
    const newSvg = new XMLSerializer().serializeToString(doc);
    setSvg(newSvg);

    // send update
    wsRef.current?.send(
      JSON.stringify({ type: "vector-update", fileUrl, svg: newSvg })
    );
  };
  const up = () => setDragging(false);

  const save = async () => {
    try {
      const res = await fetch("/api/save-vector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, svg }),
      });
      if (!res.ok) throw new Error("Save failed");
      alert("Saved!");
    } catch (e) {
      console.error(e);
      alert("Save error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-2xl font-semibold mb-4">Stitch Editor</h3>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full border rounded mb-4"
          onMouseDown={down}
          onMouseMove={move}
          onMouseUp={up}
          onMouseLeave={up}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={save}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}