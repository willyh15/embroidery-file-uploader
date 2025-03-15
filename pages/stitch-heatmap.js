import { useState, useEffect } from "react";

export default function StitchHeatmap() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      if (!selectedFile) return;
      const response = await fetch(`/api/get-stitch-heatmap?file=${selectedFile}`);
      const data = await response.json();
      setHeatmapData(data.heatmap);
    };

    fetchHeatmapData();
  }, [selectedFile]);

  return (
    <div>
      <h1>Stitch Heatmap</h1>
      <select onChange={(e) => setSelectedFile(e.target.value)}>
        <option value="">Select a file</option>
        <option value="design1.pes">Design 1</option>
        <option value="design2.pes">Design 2</option>
      </select>
      <ul>
        {heatmapData.map((stitch, index) => (
          <li key={index}>{`(${stitch.x}, ${stitch.y}) - Density: ${stitch.density}`}</li>
        ))}
      </ul>
    </div>
  );
}