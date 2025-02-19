import { useState, useEffect } from "react";

const [stitchPath, setStitchPath] = useState([]);
const [currentIndex, setCurrentIndex] = useState(0);

const fetchStitchPath = async (fileUrl) => {
  const response = await fetch("/api/stitch-path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl }),
  });

  const data = await response.json();
  setStitchPath(data.stitchPath);
};

useEffect(() => {
  if (stitchPath.length === 0) return;

  const interval = setInterval(() => {
    setCurrentIndex((prevIndex) => (prevIndex < stitchPath.length - 1 ? prevIndex + 1 : prevIndex));
  }, 50);

  return () => clearInterval(interval);
}, [stitchPath]);

<button onClick={() => fetchStitchPath(fileUrl)}>Simulate Stitching</button>

<svg width="500" height="500" style={{ border: "1px solid black" }}>
  {stitchPath.slice(0, currentIndex).map((stitch, index) => (
    <circle key={index} cx={stitch.x} cy={stitch.y} r="2" fill="black" />
  ))}
</svg>