import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function StitchEditor({ fileUrl, onClose }) {
  const canvasRef = useRef(null);
  const [vectorData, setVectorData] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchVectorData = async () => {
      try {
        const res = await fetch(`/api/vector-data?fileUrl=${encodeURIComponent(fileUrl)}`);
        const data = await res.json();
        setVectorData(data);
      } catch (err) {
        console.error("Failed to fetch vector data", err);
      }
    };

    fetchVectorData();
  }, [fileUrl]);

  useEffect(() => {
    if (!vectorData || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    vectorData.paths.forEach((path, index) => {
      ctx.beginPath();
      path.commands.forEach((cmd, i) => {
        const [x, y] = cmd.coords;
        if (cmd.type === "M") ctx.moveTo(x, y);
        else if (cmd.type === "L") ctx.lineTo(x, y);
      });
      ctx.strokeStyle = index === selectedPath ? "red" : "black";
      ctx.stroke();
    });
  }, [vectorData, selectedPath]);

  const handleMouseDown = (e) => {
    const bounds = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    if (!vectorData) return;
    for (let i = 0; i < vectorData.paths.length; i++) {
      const path = vectorData.paths[i];
      for (const cmd of path.commands) {
        const [px, py] = cmd.coords;
        if (Math.abs(x - px) < 10 && Math.abs(y - py) < 10) {
          setSelectedPath(i);
          setOffset({ x: px - x, y: py - y });
          setDragging(true);
          return;
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging || selectedPath === null) return;
    const bounds = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    setVectorData(prev => {
      const newPaths = [...prev.paths];
      const path = { ...newPaths[selectedPath] };
      path.commands = path.commands.map(cmd => ({
        ...cmd,
        coords: [x + offset.x, y + offset.y],
      }));
      newPaths[selectedPath] = path;
      return { ...prev, paths: newPaths };
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-4xl p-4 relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold mb-4">Stitch Editor</h3>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border border-gray-300 rounded"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
  );
}
