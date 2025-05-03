import { useEffect, useRef, useState } from "react";

export default function StitchPreviewModal({ fileUrl, onClose }) {
  const [points, setPoints] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!fileUrl) return;

    const filename = fileUrl.split("/").pop();
    fetch(`https://embroideryfiles.duckdns.org/api/preview-data/${filename}`)
      .then(res => res.json())
      .then(data => {
        if (data?.points) setPoints(data.points);
      });
  }, [fileUrl]);

  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear and scale
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "purple";
    ctx.lineWidth = 1;

    // Find bounds to center design
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    const scale = 5;
    const offsetX = (canvas.width - (maxX - minX) * scale) / 2;
    const offsetY = (canvas.height - (maxY - minY) * scale) / 2;

    ctx.beginPath();
    ctx.moveTo(points[0][0] * scale + offsetX, points[0][1] * scale + offsetY);

    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      ctx.lineTo(x * scale + offsetX, y * scale + offsetY);
    }

    ctx.stroke();
  }, [points]);

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>PES Stitch Preview</h3>
        <canvas ref={canvasRef} width={400} height={400} className="border mb-4" />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}