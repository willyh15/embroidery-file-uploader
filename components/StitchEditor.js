// components/StitchEditor.js
import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function StitchEditor({ fileUrl, onClose }) {
  const canvasRef = useRef(null);
  const [svgPathData, setSvgPathData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [selectedPathIndex, setSelectedPathIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetch(`/api/vector-data?fileUrl=${encodeURIComponent(fileUrl)}`)
      .then((res) => res.json())
      .then((data) => setSvgPathData(data.svg))
      .catch((err) => console.error("Failed to fetch SVG:", err));
  }, [fileUrl]);

  useEffect(() => {
    const ws = new WebSocket("wss://" + window.location.host + "/ws/edit");
    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket closed");
    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onmessage = (msg) => {
      try {
        const { type, fileUrl: incomingUrl, svg } = JSON.parse(msg.data);
        if (type === "vector-update" && incomingUrl === fileUrl) {
          setSvgPathData(svg);
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };
    setSocket(ws);
    return () => ws.close();
  }, [fileUrl]);

  useEffect(() => {
    if (!canvasRef.current || !svgPathData) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgPathData, "image/svg+xml");
    const paths = svgDoc.querySelectorAll("path");

    paths.forEach((path, i) => {
      const path2D = new Path2D(path.getAttribute("d"));
      ctx.strokeStyle = i === selectedPathIndex ? "red" : "black";
      ctx.lineWidth = 2;
      ctx.stroke(path2D);
    });
  }, [svgPathData, selectedPathIndex]);

  const handleMouseDown = (e) => {
    const bounds = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    // Placeholder: always select first path for now
    setSelectedPathIndex(0);
    setDragOffset({ x, y });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || selectedPathIndex == null) return;
    const bounds = canvasRef.current.getBoundingClientRect();
    const dx = e.clientX - bounds.left - dragOffset.x;
    const dy = e.clientY - bounds.top - dragOffset.y;
    setDragOffset({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });

    // Placeholder: simulate simple transformation
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgPathData, "image/svg+xml");
    const paths = svgDoc.querySelectorAll("path");
    const path = paths[selectedPathIndex];
    path.setAttribute("transform", `translate(${dx},${dy})`);
    const updatedSvg = new XMLSerializer().serializeToString(svgDoc);
    setSvgPathData(updatedSvg);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "vector-update",
        fileUrl,
        svg: updatedSvg,
      }));
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-black"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold mb-4">Stitch Editor</h3>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="border border-gray-300 rounded"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
  );
}
