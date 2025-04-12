import React, { useEffect, useState, useRef } from "react";
import { XCircle, GripHorizontal, Palette, Move } from "lucide-react";

export default function StitchEditor({ fileUrl, onClose }) {
  const canvasRef = useRef(null);
  const [vectorData, setVectorData] = useState(null);
  const [selectedPathIndex, setSelectedPathIndex] = useState(null);
  const [density, setDensity] = useState("Normal");

  useEffect(() => {
    fetch(`/api/vector-data?fileUrl=${encodeURIComponent(fileUrl)}`)
      .then((res) => res.json())
      .then((data) => setVectorData(data))
      .catch((err) => console.error("Failed to load vector data:", err));
  }, [fileUrl]);

  useEffect(() => {
    if (!vectorData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    vectorData.paths.forEach((path, idx) => {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.strokeStyle = selectedPathIndex === idx ? "#ff0000" : "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [vectorData, selectedPathIndex]);

  const handleCanvasClick = (e) => {
    if (!vectorData) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hit = vectorData.paths.findIndex((path) =>
      path.some((point) => Math.hypot(point.x - x, point.y - y) < 10)
    );
    setSelectedPathIndex(hit !== -1 ? hit : null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg p-4 w-[90%] max-w-5xl shadow-xl relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <XCircle className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-2">Stitch Editor</h2>
        <p className="text-sm mb-4 text-gray-500">Click a shape to inspect or drag in future versions.</p>

        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            <span className="text-sm">Thread Colors: {vectorData?.threadColors?.join(", ") || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2">
            <GripHorizontal className="w-5 h-5 text-green-600" />
            <label className="text-sm">Density:</label>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="border rounded bg-gray-100 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair"
          />
        </div>

        {selectedPathIndex !== null && (
          <div className="mt-4 p-2 border rounded bg-yellow-100">
            <div className="text-sm font-medium text-gray-800 mb-1">Selected Path: {selectedPathIndex + 1}</div>
            <div className="text-xs text-gray-600">Points: {vectorData.paths[selectedPathIndex].length}</div>
          </div>
        )}
      </div>
    </div>
  );
}
