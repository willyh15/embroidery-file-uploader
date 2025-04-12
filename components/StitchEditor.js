import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function StitchEditor({ fileUrl, onClose }) {
  const canvasRef = useRef(null);
  const [vectorPaths, setVectorPaths] = useState([]);
  const [threadColor, setThreadColor] = useState("#007bff");
  const [density, setDensity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVectorData = async () => {
      try {
        const fileName = fileUrl.split("/").pop().split(".")[0];
        const res = await fetch(`/api/vector-data?name=${fileName}`);
        const data = await res.json();
        setVectorPaths(data.paths || []);
      } catch (err) {
        console.error("Error loading vector data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVectorData();
  }, [fileUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = threadColor;
    ctx.lineWidth = density;

    vectorPaths.forEach((path) => {
      ctx.beginPath();
      path.forEach(([x, y], index) => {
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }, [vectorPaths, threadColor, density]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-4 w-[90%] max-w-4xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-red-500">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Stitch Editor</h2>

        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Thread Color</label>
            <input
              type="color"
              value={threadColor}
              onChange={(e) => setThreadColor(e.target.value)}
              className="border border-gray-300 rounded p-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Density</label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={density}
              onChange={(e) => setDensity(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className="ml-2 text-sm">{density.toFixed(1)}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading vector data...</div>
        ) : (
          <canvas ref={canvasRef} width={600} height={400} className="border rounded shadow" />
        )}
      </div>
    </div>
  );
}
