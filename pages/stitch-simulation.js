import { useState, useEffect } from "react";

export default function StitchSimulation({ fileUrl }) {
  const [stitchPath, setStitchPath] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch the stitch path from the API
  const fetchStitchPath = async () => {
    if (!fileUrl) {
      alert("No file selected for simulation.");
      return;
    }

    try {
      const response = await fetch("/api/stitch-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      if (!response.ok) throw new Error("Failed to fetch stitch path");

      const data = await response.json();
      setStitchPath(data.stitchPath);
      setCurrentIndex(0); // Reset animation
    } catch (error) {
      console.error("Error fetching stitch path:", error);
      alert("An error occurred while fetching the stitch path.");
    }
  };

  // Animate stitch simulation
  useEffect(() => {
    if (stitchPath.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex < stitchPath.length - 1 ? prevIndex + 1 : prevIndex));
    }, 50);

    return () => clearInterval(interval);
  }, [stitchPath]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Stitch Simulation</h2>

      {/* Start Simulation Button */}
      <button onClick={fetchStitchPath}>Simulate Stitching</button>

      {/* SVG Stitch Visualization */}
      <svg width="500" height="500" style={{ border: "1px solid black", marginTop: "20px" }}>
        {stitchPath.slice(0, currentIndex).map((stitch, index) => (
          <circle key={index} cx={stitch.x} cy={stitch.y} r="2" fill="black" />
        ))}
      </svg>
    </div>
  );
}
