import { useState, useEffect } from "react";

export default function StitchSmoothing() {
  const [stitchData, setStitchData] = useState([]);
  const [smoothedData, setSmoothedData] = useState([]);
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    const fetchStitchData = async () => {
      if (!fileUrl) return;
      const response = await fetch(`/api/get-stitch-data?file=${fileUrl}`);
      const data = await response.json();
      setStitchData(data.stitches);
    };

    fetchStitchData();
  }, [fileUrl]);

  const smoothStitches = async () => {
    const response = await fetch("/api/smooth-stitches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await response.json();
    setSmoothedData(data.smoothedStitches);
  };

  return (
    <div>
      <h1>Stitch Smoothing</h1>
      <input
        type="text"
        placeholder="Enter file URL"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
      />
      <button onClick={smoothStitches}>Smooth Stitches</button>
      
      <h2>Original Stitches</h2>
      <ul>
        {stitchData.map((stitch, index) => (
          <li key={index}>{`(${stitch.x}, ${stitch.y})`}</li>
        ))}
      </ul>

      <h2>Smoothed Stitches</h2>
      <ul>
        {smoothedData.map((stitch, index) => (
          <li key={index}>{`(${stitch.x}, ${stitch.y})`}</li>
        ))}
      </ul>
    </div>
  );
}